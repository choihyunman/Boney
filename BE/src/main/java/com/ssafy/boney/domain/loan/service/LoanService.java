package com.ssafy.boney.domain.loan.service;

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

        // 보호자 관계 조회
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


}
