package com.ssafy.boney.domain.loan.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.loan.dto.*;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.LoanRepayment;
import com.ssafy.boney.domain.loan.entity.LoanSignature;
import com.ssafy.boney.domain.loan.entity.enums.SignerType;
import com.ssafy.boney.domain.loan.entity.enums.LoanStatus;
import com.ssafy.boney.domain.loan.repository.LoanRepaymentRepository;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.loan.repository.LoanSignatureRepository;
import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.codec.binary.Base64;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final UserRepository userRepository;
    private final ParentChildRepository parentChildRepository;
    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final BankingApiService bankingApiService;
    private final PasswordEncoder passwordEncoder;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final CreditScoreRepository creditScoreRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    private final S3Service s3Service;
    private final LoanSignatureRepository loanSignatureRepository;
    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Transactional
    public ResponseEntity<?> createLoan(Integer childId, LoanRequest request) {
        // 1. 요청 검증
        if (request.getLoanAmount() == null || request.getDueDate() == null || request.getSignature() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 405,
                    "message", "loan_amount, due_date, signature는 필수입니다."
            ));
        }

        // 2. 자녀 조회
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 3. 신용 점수 검증
        int creditScore = (child.getCreditScore() != null) ? child.getCreditScore().getScore() : 0;
        if (creditScore < 30) {
            return ResponseEntity.ok(Map.of(
                    "status", "200",
                    "message", "신용 점수가 30 미만입니다. 대출을 신청할 수 없습니다.",
                    "data", Map.of(
                            "credit_score", creditScore,
                            "is_loan_allowed", false
                    )
            ));
        }

        // 4. 부모 관계 확인
        Optional<ParentChild> relationOpt = child.getParents().stream().findFirst();
        if (relationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "부모와의 연결이 없습니다."
            ));
        }
        ParentChild relation = relationOpt.get();
        User parent = relation.getParent();

        // 5. Loan 저장
        Loan loan = Loan.builder()
                .loanAmount(request.getLoanAmount())
                .dueDate(request.getDueDate())
                .status(LoanStatus.REQUESTED)
                .requestedAt(LocalDateTime.now())
                .parentChild(relation)
                .build();
        loanRepository.save(loan);

        // (FCM) 부모에게 대출 신청 알림 전송
        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(parent.getUserId())
                .notificationTypeId(7)  // 7번: 'LOAN_APPLICATION'
                .notificationTitle("대출 요청")
                .notificationContent(child.getUserName() + "님이 대출을 요청했어요")
                .notificationAmount(loan.getLoanAmount())
                .referenceId(loan.getLoanId())
                .build();
        notificationService.sendNotification(notificationRequest);

        // 6. 전자서명 base64 → S3 업로드
        try {
            byte[] decodedBytes = Base64.decodeBase64(request.getSignature());
            ByteArrayInputStream inputStream = new ByteArrayInputStream(decodedBytes);

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(decodedBytes.length);
            metadata.setContentType("image/png");

            String fileName = "loan/signatures/" + UUID.randomUUID() + ".png";
            amazonS3.putObject(bucket, fileName, inputStream, metadata);
            String s3Url = amazonS3.getUrl(bucket, fileName).toString();

            // 7. LoanSignature 저장 (CHILD로 명시)
            LoanSignature signature = LoanSignature.builder()
                    .loan(loan)
                    .signatureUrl(s3Url)
                    .signedAt(LocalDateTime.now())
                    .signerType(SignerType.CHILD)
                    .build();
            loanSignatureRepository.save(signature);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "message", "전자 서명 업로드 실패: " + e.getMessage()
            ));
        }

        // 8. 응답
        LoanResponse response = LoanResponse.builder()
                .parentName(parent.getUserName())
                .childName(child.getUserName())
                .loanAmount(loan.getLoanAmount())
                .dueDate(loan.getDueDate())
                .loanStatus(loan.getStatus().name())
                .build();

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 요청이 성공적으로 접수되었습니다.",
                "data", response
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getRequestedLoansByParent(Integer parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        List<ParentChild> relations = parentChildRepository.findByParent(parent);
        List<Map<String, Object>> loanList = new ArrayList<>();

        for (ParentChild relation : relations) {
            User child = relation.getChild();

            List<Loan> requestedLoans = loanRepository.findByParentChild(relation).stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.REQUESTED)
                    .toList();

            for (Loan loan : requestedLoans) {
                LoanSignature signature = loanSignatureRepository.findByLoan(loan)
                        .orElse(null); // 반드시 존재한다고 가정했지만 혹시 모르니 null 체크

                Map<String, Object> loanInfo = Map.of(
                        "loan_id", loan.getLoanId(),
                        "child_name", child.getUserName(),
                        "loan_amount", loan.getLoanAmount(),
                        "request_date", loan.getRequestedAt().toLocalDate().toString(),
                        "due_date", loan.getDueDate().toLocalDate().toString(),
                        "child_credit_score", child.getCreditScore() != null ? child.getCreditScore().getScore() : 0,
                        "child_signature", signature != null ? signature.getSignatureUrl() : ""
                );

                loanList.add(loanInfo);
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 요청이 성공적으로 확인되었습니다.",
                "data", Map.of("loan_list", loanList)
        ));
    }

    // 대출 승인 상태로 변경
    @Transactional
    public ResponseEntity<?> approveLoan(LoanApproveAndTransferRequest request, Integer parentId) {
        if (request.getLoanId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 403,
                    "message", "loan_id는 필수입니다."
            ));
        }

        Loan loan = loanRepository.findById(request.getLoanId()).orElse(null);
        if (loan == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 404,
                    "message", "해당 loan_id에 대한 대출 정보를 찾을 수 없습니다."
            ));
        }

        ParentChild relation = loan.getParentChild();
        User parent = relation.getParent();
        User child = relation.getChild();

        if (!parent.getUserId().equals(parentId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "토큰이 없거나 만료되었습니다."
            ));
        }

        Account parentAccount = accountRepository.findByUser(parent)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), parentAccount.getAccountPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 402,
                    "message", "계좌 비밀번호가 올바르지 않습니다."
            ));
        }

        Long balance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());
        Long loanAmount = loan.getLoanAmount();

        if (balance < loanAmount) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 405,
                    "message", "부모 계좌의 잔액이 부족합니다.",
                    "data", Map.of(
                            "available_balance", balance,
                            "required_amount", loanAmount
                    )
            ));
        }

        // ✅ 부모 전자서명 처리 (base64 → S3)
        if (request.getParentSignature() != null) {
            // 이미 해당 loan에 대해 부모 서명이 있는지 확인
            boolean parentSigned = loanSignatureRepository.findByLoanAndSignerType(loan, SignerType.PARENT).isPresent();

            if (!parentSigned) {
                try {
                    byte[] decodedBytes = Base64.decodeBase64(request.getParentSignature());
                    ByteArrayInputStream inputStream = new ByteArrayInputStream(decodedBytes);

                    ObjectMetadata metadata = new ObjectMetadata();
                    metadata.setContentLength(decodedBytes.length);
                    metadata.setContentType("image/png");

                    String fileName = "loan/signatures/" + UUID.randomUUID() + ".png";
                    amazonS3.putObject(bucket, fileName, inputStream, metadata);
                    String s3Url = amazonS3.getUrl(bucket, fileName).toString();

                    LoanSignature signature = LoanSignature.builder()
                            .loan(loan)
                            .signatureUrl(s3Url)
                            .signedAt(LocalDateTime.now())
                            .signerType(SignerType.PARENT)
                            .build();
                    loanSignatureRepository.save(signature);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                            "status", 500,
                            "message", "부모 전자 서명 저장 실패: " + e.getMessage()
                    ));
                }
            }
        }

        // 송금 처리
        bankingApiService.transfer(
                parentAccount.getAccountNumber(),
                childAccount.getAccountNumber(),
                loanAmount,
                "대출 승인 " + parent.getUserName()
        );

        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 요청이 승인되었습니다.",
                "data", Map.of(
                        "loan_id", loan.getLoanId(),
                        "child_name", child.getUserName(),
                        "loan_amount", loanAmount,
                        "approved_at", loan.getApprovedAt().toLocalDate().toString(),
                        "due_date", loan.getDueDate().toLocalDate().toString(),
                        "loan_status", loan.getStatus().name()
                )
        ));
    }

    // 대출 요청 거절
    @Transactional
    public ResponseEntity<?> rejectLoan(LoanRejectRequest request, Integer parentId) {
        if (request.getLoanId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "loan_id는 필수입니다."
            ));
        }

        Loan loan = loanRepository.findById(request.getLoanId()).orElse(null);

        if (loan == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "해당 loan_id에 대한 대출 정보를 찾을 수 없습니다."
            ));
        }

        // 부모 검증
        ParentChild relation = loan.getParentChild();
        if (!relation.getParent().getUserId().equals(parentId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "토큰이 없거나 만료되었습니다."
            ));
        }

        // 상태 변경
        loan.setStatus(LoanStatus.REJECTED);
        // 승인 시간에 거절 시간도 함께 저장
        loan.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 요청이 거절되었습니다.",
                "data", Map.of(
                        "loan_id", loan.getLoanId(),
                        "approved_at", loan.getApprovedAt(),
                        "loan_status", loan.getStatus().name()
                )
        ));
    }

    @Transactional
    public ResponseEntity<?> transferLoanAmount(LoanTransferRequest request, Integer parentId) {
        if (request.getLoanId() == null || request.getLoanAmount() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "loan_id와 loan_amount는 필수입니다."
            ));
        }

        Loan loan = loanRepository.findById(request.getLoanId())
                .orElse(null);

        if (loan == null || loan.getStatus() != LoanStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "존재하지 않거나 승인되지 않은 대출입니다."
            ));
        }

        ParentChild relation = loan.getParentChild();

        if (!relation.getParent().getUserId().equals(parentId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "권한이 없습니다."
            ));
        }

        // 계좌 정보 조회
        User child = relation.getChild();
        Account parentAccount = accountRepository.findByUser(relation.getParent())
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        // 🔐 잔액 확인
        Long balance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());
        if (balance < request.getLoanAmount()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "부모 계좌의 잔액이 부족합니다.",
                    "data", Map.of(
                            "available_balance", balance,
                            "required_amount", request.getLoanAmount()
                    )
            ));
        }

        // 송금 처리
        String summary = "대출 " + relation.getParent().getUserName();
        bankingApiService.transfer(
                parentAccount.getAccountNumber(),
                childAccount.getAccountNumber(),
                request.getLoanAmount(),
                summary
        );

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출금이 성공적으로 송금되었습니다.",
                "data", Map.of(
                        "loan_id", loan.getLoanId(),
                        "child_name", child.getUserName(),
                        "transferred_amount", request.getLoanAmount()
                )
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getApprovedLoansByParent(Integer parentId) {
        // 보호자 조회
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 보호자-자녀 관계 조회
        List<ParentChild> relations = parentChildRepository.findByParent(parent);

        List<Map<String, Object>> loanList = new ArrayList<>();

        for (ParentChild relation : relations) {
            User child = relation.getChild();

            List<Loan> approvedLoans = loanRepository.findByParentChild(relation).stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.APPROVED)
                    .toList();

            for (Loan loan : approvedLoans) {
                Map<String, Object> loanInfo = Map.of(
                        "loan_id", loan.getLoanId(),
                        "child_name", child.getUserName(),
                        "loan_amount", loan.getLoanAmount(),
                        "last_amount", loan.getLastAmount() != null ? loan.getLastAmount() : loan.getLoanAmount(),
                        "request_date", loan.getRequestedAt().toLocalDate().toString(),
                        "due_date", loan.getDueDate().toLocalDate().toString(),
                        "child_credit_score", child.getCreditScore() != null ? child.getCreditScore().getScore() : 0
                );
                loanList.add(loanInfo);
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "진행 중인 대출이 성공적으로 확인되었습니다.",
                "data", Map.of("loan_list", loanList)
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getLoanDetail(Integer loanId, Integer userId) {
        if (loanId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "요청 형식 또는 파라미터가 잘못되었습니다."
            ));
        }

        Loan loan = loanRepository.findById(loanId).orElse(null);
        if (loan == null || loan.getParentChild() == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "loan_id에 해당하는 대출 내역이 존재하지 않습니다."
            ));
        }

        ParentChild relation = loan.getParentChild();
        if (relation.getParent() == null || relation.getChild() == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "대출에 연결된 부모 또는 자녀 정보가 없습니다."
            ));
        }

        User parent = relation.getParent();
        User child = relation.getChild();

        // 권한 체크
        if (!Objects.equals(parent.getUserId(), userId) && !Objects.equals(child.getUserId(), userId)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        Integer creditScore = child.getCreditScore() != null ? child.getCreditScore().getScore() : 0;

        // 서명 정보 조회
        String childSignature = loanSignatureRepository.findByLoanAndSignerType(loan, SignerType.CHILD)
                .map(LoanSignature::getSignatureUrl).orElse(null);
        String parentSignature = loanSignatureRepository.findByLoanAndSignerType(loan, SignerType.PARENT)
                .map(LoanSignature::getSignatureUrl).orElse(null);

        Map<String, Object> loanDetail = new HashMap<>();
        loanDetail.put("loan_id", loan.getLoanId());
        loanDetail.put("parent_name", Optional.ofNullable(parent.getUserName()).orElse("알 수 없음"));
        loanDetail.put("child_name", Optional.ofNullable(child.getUserName()).orElse("알 수 없음"));
        loanDetail.put("loan_amount", loan.getLoanAmount());
        loanDetail.put("last_amount", loan.getLastAmount() != null ? loan.getLastAmount() : loan.getLoanAmount());
        loanDetail.put("approved_at", loan.getApprovedAt() != null ? loan.getApprovedAt().toString() : null);
        loanDetail.put("repaid_at", loan.getRepaidAt() != null ? loan.getRepaidAt().toString() : null);
        loanDetail.put("request_date", loan.getRequestedAt() != null ? loan.getRequestedAt().toLocalDate().toString() : null);
        loanDetail.put("due_date", loan.getDueDate() != null ? loan.getDueDate().toLocalDate().toString() : null);
        loanDetail.put("child_credit_score", creditScore);
        loanDetail.put("child_signature", childSignature);
        loanDetail.put("parent_signature", parentSignature);

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 상세 내역이 조회되었습니다.",
                "data", loanDetail
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getRequestedLoansByChild(Integer childId) {
        if (childId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "요청 형식 또는 파라미터가 잘못되었습니다."
            ));
        }

        User child = userRepository.findById(childId)
                .orElse(null);

        if (child == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        Optional<ParentChild> relationOpt = child.getParents().stream().findFirst();
        if (relationOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "loan_id에 해당하는 대출 내역이 존재하지 않습니다."
            ));
        }

        List<Loan> requestedLoans = loanRepository.findByParentChild(relationOpt.get()).stream()
                .filter(loan -> loan.getStatus() == LoanStatus.REQUESTED)
                .toList();

        if (requestedLoans.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "loan_id에 해당하는 대출 내역이 존재하지 않습니다."
            ));
        }

        List<Map<String, Object>> loanList = new ArrayList<>();
        for (Loan loan : requestedLoans) {
            Map<String, Object> loanInfo = new HashMap<>();
            loanInfo.put("loan_id", loan.getLoanId());
            loanInfo.put("loan_amount", loan.getLoanAmount());
            loanInfo.put("request_date", loan.getRequestedAt().toLocalDate().toString());
            loanInfo.put("due_date", loan.getDueDate().toLocalDate().toString());
            loanList.add(loanInfo);
        }

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 대기 목록이 조회되었습니다.",
                "data", Map.of("loan_pending_list", loanList)
        ));
    }

    // 신청한 대출 취소 - 아이
    @Transactional
    public ResponseEntity<?> deleteRequestedLoan(Integer loanId, Integer childId) {
        Loan loan = loanRepository.findById(loanId).orElse(null);

        if (loan == null || loan.getParentChild() == null || loan.getParentChild().getChild() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", 404,
                    "message", "대출 신청 정보를 찾을 수 없습니다."
            ));
        }

        User loanChild = loan.getParentChild().getChild();
        if (!loanChild.getUserId().equals(childId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        if (loan.getStatus() != LoanStatus.REQUESTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "대출 신청 취소 실패 - 이미 승인되었거나 거절된 대출입니다."
            ));
        }

        // 관련 전자서명 먼저 삭제
        loanSignatureRepository.findByLoan(loan)
                .ifPresent(loanSignatureRepository::delete);

        // 그 다음 loan 삭제
        loanRepository.delete(loan);

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 신청이 성공적으로 취소되었습니다."
        ));
    }


    // 대출 상환
    @Transactional
    public ResponseEntity<?> repayLoan(Integer childId, LoanRepaymentRequest request) {
        // 1. 자녀 조회
        User child = userRepository.findById(childId)
                .orElse(null);
        if (child == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "사용자를 찾을 수 없습니다."
            ));
        }

        // 2. 대출 조회 및 검증
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElse(null);
        if (loan == null) {
            return ResponseEntity.status(405).body(Map.of(
                    "status", 405,
                    "message", "대출 정보를 찾을 수 없습니다."
            ));
        }

        if (!loan.getParentChild().getChild().getUserId().equals(childId)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "해당 대출에 대한 권한이 없습니다."
            ));
        }

        if (loan.getStatus() != LoanStatus.REQUESTED && loan.getStatus() != LoanStatus.APPROVED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "이미 상환된 대출입니다."
            ));
        }

        // 3. 자녀/부모 계좌 조회
        Account childAccount = accountRepository.findByUser(child)
                .orElse(null);
        if (childAccount == null) {
            return ResponseEntity.status(406).body(Map.of(
                    "status", 406,
                    "message", "자녀 계좌를 찾을 수 없습니다."
            ));
        }

        Account parentAccount = accountRepository.findByUser(loan.getParentChild().getParent())
                .orElse(null);
        if (parentAccount == null) {
            return ResponseEntity.status(407).body(Map.of(
                    "status", 407,
                    "message", "부모 계좌를 찾을 수 없습니다."
            ));
        }

        // 4. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), childAccount.getAccountPassword())) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", 403,
                    "message", "계좌 비밀번호가 올바르지 않습니다."
            ));
        }

        // 5. 외부 API를 통한 잔액 조회
        Long availableBalance = bankingApiService.getAccountBalance(childAccount.getAccountNumber());
        Long repaymentAmount = request.getRepaymentAmount();
        Long remainingAmount = (loan.getLastAmount() != null) ? loan.getLastAmount() : loan.getLoanAmount();

        if (availableBalance < repaymentAmount) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 408,
                    "message", "자녀 계좌의 잔액이 부족합니다.",
                    "data", Map.of(
                            "available_balance", availableBalance,
                            "required_amount", repaymentAmount
                    )
            ));
        }

        // 6. 송금 처리
        String summary = "대출상환 " + child.getUserName();
        bankingApiService.transfer(
                childAccount.getAccountNumber(),
                parentAccount.getAccountNumber(),
                repaymentAmount,
                summary
        );

        // 7. 상환 기록 저장 (loan_repayment)
        LoanRepayment repayment = LoanRepayment.builder()
                .loan(loan)
                .repaymentDate(LocalDateTime.now())
                .principalAmount(repaymentAmount)
                .createdAt(LocalDateTime.now())
                .build();
        loanRepaymentRepository.save(repayment);

        // 8. 대출 잔액 갱신 및 상태 변경
        Long newLastAmount = remainingAmount - repaymentAmount;
        loan.setLastAmount(newLastAmount);

        if (newLastAmount <= 0) {
            loan.setStatus(LoanStatus.REPAID);
            loan.setRepaidAt(LocalDateTime.now());

            // 신용 점수 +10
            CreditScore creditScore = creditScoreRepository.findByUser(child)
                    .orElseThrow(() -> new IllegalArgumentException("신용 점수 정보가 없습니다."));
            int currentScore = creditScore.getScore();
            int newScore = Math.min(currentScore + 10, 100); // 최대 100점 제한
            creditScore.updateScore(newScore);

            // (FCM) 보호자에게 대출 상환 완료 알림 전송
            User parent = loan.getParentChild().getParent();
            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .userId(parent.getUserId())
                    .notificationTypeId(8)  // 8번: 'LOAN_REPAYMENT_COMPLETED'
                    .notificationTitle("대출 상환 완료")
                    .notificationContent(child.getUserName() + "님이 대출 상환을 완료했어요")
                    .notificationAmount(loan.getLoanAmount())
                    .referenceId(loan.getLoanId())
                    .build();
            notificationService.sendNotification(notificationRequest);
        }

        Integer updatedScore = creditScoreRepository.findByUser(child)
                .map(CreditScore::getScore)
                .orElse(0);

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "대출 상환이 성공적으로 처리되었습니다.",
                "data", Map.of(
                        "loan_id", loan.getLoanId(),
                        "due_date", loan.getDueDate().toLocalDate().toString(),
                        "repayment_amount", repaymentAmount,
                        "loan_amount", loan.getLoanAmount(),
                        "last_amount", loan.getLastAmount(),
                        "loan_status", loan.getStatus().name(),
                        "child_credit_score", updatedScore
                )
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getRepaidLoansByChild(Integer childId) {
        if (childId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "400",
                    "message", "요청 형식 또는 헤더가 잘못되었습니다."
            ));
        }

        User child = userRepository.findById(childId).orElse(null);
        if (child == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "401",
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        Optional<ParentChild> relationOpt = child.getParents().stream().findFirst();
        if (relationOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "404",
                    "message", "부모와의 관계를 찾을 수 없습니다."
            ));
        }

        List<Loan> repaidLoans = loanRepository.findByParentChild(relationOpt.get()).stream()
                .filter(loan -> loan.getStatus() == LoanStatus.REPAID)
                .toList();

        List<Map<String, Object>> loanList = new ArrayList<>();
        for (Loan loan : repaidLoans) {
            Map<String, Object> map = new HashMap<>();
            map.put("loan_id", loan.getLoanId());
            map.put("loan_amount", loan.getLoanAmount());
            map.put("repaid_at", loan.getRepaidAt() != null ? loan.getRepaidAt().toLocalDate().toString() : null);
            loanList.add(map);
        }

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 상환 내역 조회에 성공했습니다.",
                "data", Map.of("loan_completed_list", loanList)
        ));
    }


    @Transactional(readOnly = true)
    public ResponseEntity<?> getRepaidLoansByParent(Integer parentId) {
        // 부모 유효성 검증
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        List<ParentChild> relations = parentChildRepository.findByParent(parent);
        List<Map<String, Object>> loanList = new ArrayList<>();

        for (ParentChild relation : relations) {
            User child = relation.getChild();

            List<Loan> repaidLoans = loanRepository.findByParentChild(relation).stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.REPAID)
                    .toList();

            for (Loan loan : repaidLoans) {
                Map<String, Object> map = new HashMap<>();
                map.put("loan_id", loan.getLoanId());
                map.put("child_name", child.getUserName());
                map.put("repaid_at", loan.getRepaidAt() != null ? loan.getRepaidAt().toLocalDate().toString() : null);
                map.put("loan_amount", loan.getLoanAmount());
                loanList.add(map);
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 상환 내역 조회에 성공했습니다.",
                "data", Map.of("loan_completed_list", loanList)
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getApprovedLoansWithRepayments(Integer childId) {
        // 1. 자녀 조회
        User child = userRepository.findById(childId).orElse(null);
        if (child == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "401",
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        // 2. 부모-자녀 관계 조회
        Optional<ParentChild> relationOpt = child.getParents().stream().findFirst();
        if (relationOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "404",
                    "message", "아이에 해당하는 대출 내역이 존재하지 않습니다."
            ));
        }

        ParentChild relation = relationOpt.get();

        // 3. 승인된 대출 조회
        List<Loan> approvedLoans = loanRepository.findByParentChild(relation).stream()
                .filter(loan -> loan.getStatus() == LoanStatus.APPROVED)
                .toList();

        // 4. active loan 목록 구성
        List<Map<String, Object>> activeLoans = new ArrayList<>();
        for (Loan loan : approvedLoans) {
            Map<String, Object> loanInfo = new HashMap<>();
            loanInfo.put("loan_id", loan.getLoanId());
            loanInfo.put("parent_name", loan.getParentChild().getParent().getUserName());
            loanInfo.put("due_date", loan.getDueDate().toLocalDate().toString());
            loanInfo.put("loan_amount", loan.getLoanAmount());
            loanInfo.put("last_amount", loan.getLastAmount() != null ? loan.getLastAmount() : loan.getLoanAmount());
            loanInfo.put("child_credit_score", child.getCreditScore() != null ? child.getCreditScore().getScore() : 0);
            activeLoans.add(loanInfo);
        }

        // 5. 상환 내역 조회
        List<Map<String, Object>> loanRepaymentHistory = new ArrayList<>();
        for (Loan loan : approvedLoans) {
            List<LoanRepayment> loanRepayments = loanRepaymentRepository.findAll().stream()
                    .filter(r -> r.getLoan().getLoanId().equals(loan.getLoanId()))
                    .sorted(Comparator.comparing(LoanRepayment::getRepaymentDate)) // 상환 일자 순 정렬
                    .toList();

            Long totalLoanAmount = loan.getLoanAmount();
            Long totalRepaid = 0L;

            for (LoanRepayment repayment : loanRepayments) {
                totalRepaid += repayment.getPrincipalAmount(); // 누적 상환

                Map<String, Object> repaymentInfo = new HashMap<>();
                repaymentInfo.put("loan_id", loan.getLoanId());
                repaymentInfo.put("repaid_amount", repayment.getPrincipalAmount());
                repaymentInfo.put("repayment_date", repayment.getRepaymentDate().toLocalDate().toString());
                repaymentInfo.put("remaining_amount", Math.max(totalLoanAmount - totalRepaid, 0)); // 남은 금액
                loanRepaymentHistory.add(repaymentInfo);
            }
        }

        if (activeLoans.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "404",
                    "message", "아이에 해당하는 대출 내역이 존재하지 않습니다."
            ));
        }

        // 6. 응답 반환
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "보유 대출 및 대출 상환 내역 조회 성공했습니다.",
                "data", Map.of(
                        "active_loans", activeLoans,
                        "loan_repayment_history", loanRepaymentHistory
                )
        ));
    }

}
