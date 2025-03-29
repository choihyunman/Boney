package com.ssafy.boney.domain.loan.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.loan.dto.*;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.LoanRepayment;
import com.ssafy.boney.domain.loan.entity.enums.LoanStatus;
import com.ssafy.boney.domain.loan.repository.LoanRepaymentRepository;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ResponseEntity<?> createLoan(Integer childId, LoanRequest request) {
        // 유효성 검증
        if (request.getLoanAmount() == null || request.getDueDate() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "loan_amount와 due_date는 필수이며, 형식이 올바르게 지정되어야 합니다."
            ));
        }

        // 자녀 조회
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 신용 점수 확인
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

        // 부모-자녀 관계 확인
        Optional<ParentChild> relationOpt = child.getParents().stream().findFirst();
        if (relationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "부모와의 연결이 없습니다."
            ));
        }

        ParentChild relation = relationOpt.get();
        User parent = relation.getParent();

        // 대출 저장
        Loan loan = Loan.builder()
                .loanAmount(request.getLoanAmount())
                .dueDate(request.getDueDate())
                .status(LoanStatus.REQUESTED)
                .requestedAt(LocalDateTime.now())
                .parentChild(relation)
                .build();

        loanRepository.save(loan);

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

    public ResponseEntity<?> getRequestedLoansByParent(Integer parentId) {
        // 보호자 조회
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 보호자의 모든 자녀 관계 조회
        List<ParentChild> relations = parentChildRepository.findByParent(parent);

        // 모든 REQUESTED 상태의 대출 수집
        List<Map<String, Object>> loanList = new ArrayList<>();

        for (ParentChild relation : relations) {
            User child = relation.getChild();

            List<Loan> requestedLoans = loanRepository.findByParentChild(relation).stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.REQUESTED)
                    .toList();

            for (Loan loan : requestedLoans) {
                Map<String, Object> loanInfo = Map.of(
                        "loan_id", loan.getLoanId(),
                        "child_name", child.getUserName(),
                        "loan_amount", loan.getLoanAmount(),
                        "request_date", loan.getRequestedAt().toLocalDate().toString(),
                        "due_date", loan.getDueDate().toLocalDate().toString(),
                        "child_credit_score", child.getCreditScore() != null ? child.getCreditScore().getScore() : 0
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
    public ResponseEntity<?> approveLoan(LoanApproveRequest request, Integer parentId) {
        if (request.getLoanId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "loan_id는 필수입니다."
            ));
        }

        Loan loan = loanRepository.findById(request.getLoanId())
                .orElse(null);

        if (loan == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "해당 loan_id에 대한 대출 정보를 찾을 수 없습니다."
            ));
        }

        // 부모 권한 검증
        ParentChild parentChild = loan.getParentChild();
        if (!parentChild.getParent().getUserId().equals(parentId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "토큰이 없거나 만료되었습니다."
            ));
        }

        // 상태 업데이트
        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 요청이 승인되었습니다.",
                "data", Map.of(
                        "loan_id", loan.getLoanId(),
                        "approved_at", loan.getApprovedAt(),
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
        String summary = "대출지급 " + relation.getParent().getUserName();
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
                        "last_amout", loan.getLastAmount() != null ? loan.getLastAmount() : loan.getLoanAmount(),
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
        if (relation == null || relation.getParent() == null || relation.getChild() == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "대출에 연결된 부모 또는 자녀 정보가 없습니다."
            ));
        }

        User parent = relation.getParent();
        User child = relation.getChild();

        // 사용자 권한 확인 (부모 또는 자녀만 접근 가능)
        if (!Objects.equals(parent.getUserId(), userId) && !Objects.equals(child.getUserId(), userId)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        Integer creditScore = child.getCreditScore() != null ? child.getCreditScore().getScore() : 0;

        String parentName = (parent != null && parent.getUserName() != null) ? parent.getUserName() : "알 수 없음";
        String childName = (child != null && child.getUserName() != null) ? child.getUserName() : "알 수 없음";

        Map<String, Object> loanDetail = new HashMap<>();
        loanDetail.put("loan_id", loan.getLoanId());
        loanDetail.put("parent_name", parent != null ? Optional.ofNullable(parent.getUserName()).orElse("알 수 없음") : "알 수 없음");
        loanDetail.put("child_name", child != null ? Optional.ofNullable(child.getUserName()).orElse("알 수 없음") : "알 수 없음");
        loanDetail.put("loan_amount", loan.getLoanAmount());
        loanDetail.put("last_amout", loan.getLastAmount() != null ? loan.getLastAmount() : loan.getLoanAmount());
        loanDetail.put("approved_at", loan.getApprovedAt() != null ? loan.getApprovedAt().toString() : null);
        loanDetail.put("repaid_at", loan.getRepaidAt() != null ? loan.getRepaidAt().toString() : null);
        loanDetail.put("request_date", loan.getRequestedAt() != null ? loan.getRequestedAt().toLocalDate().toString() : null);
        loanDetail.put("due_date", loan.getDueDate() != null ? loan.getDueDate().toLocalDate().toString() : null);
        loanDetail.put("child_credit_score", creditScore);

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
            loanInfo.put("total_loan_amount", loan.getLoanAmount());
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

        loanRepository.delete(loan);

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "대출 신청이 성공적으로 취소되었습니다."
        ));
    }


    @Transactional
    public ResponseEntity<?> repayLoan(Integer childId, LoanRepaymentRequest request) {
        // 1. 자녀 조회
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 대출 조회 및 검증
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElseThrow(() -> new IllegalArgumentException("대출 정보를 찾을 수 없습니다."));

        System.out.println("loanId: " + loan.getLoanId()); // <= 반드시 null이 아니어야 합니다

        if (!loan.getParentChild().getChild().getUserId().equals(childId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
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
                .orElseThrow(() -> new IllegalArgumentException("자녀 계좌를 찾을 수 없습니다."));
        Account parentAccount = accountRepository.findByUser(loan.getParentChild().getParent())
                .orElseThrow(() -> new IllegalArgumentException("부모 계좌를 찾을 수 없습니다."));

        // 4. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), childAccount.getAccountPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "계좌 비밀번호가 올바르지 않습니다."
            ));
        }

        // 5. 외부 API를 통한 잔액 조회
        Long availableBalance = bankingApiService.getAccountBalance(childAccount.getAccountNumber());
        Long repaymentAmount = request.getRepaymentAmount();
        Long remainingAmount = (loan.getLastAmount() != null) ? loan.getLastAmount() : loan.getLoanAmount();

        if (availableBalance < repaymentAmount) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "자녀 계좌의 잔액이 부족합니다.",
                    "data", Map.of(
                            "available_balance", availableBalance,
                            "required_amount", repaymentAmount
                    )
            ));
        }

        // 6. 송금 처리
        String summary = "대출 상환 " + child.getUserName();
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
            creditScore.updateScore(10);
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
                        "total_loan_amount", loan.getLoanAmount(),
                        "last_amount", loan.getLastAmount(),
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

}
