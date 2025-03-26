package com.ssafy.boney.domain.loan.service;

import com.ssafy.boney.domain.loan.dto.LoanApproveRequest;
import com.ssafy.boney.domain.loan.dto.LoanRejectRequest;
import com.ssafy.boney.domain.loan.dto.LoanRequest;
import com.ssafy.boney.domain.loan.dto.LoanResponse;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.enums.LoanStatus;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final UserRepository userRepository;
    private final ParentChildRepository parentChildRepository;
    private final LoanRepository loanRepository;

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


}
