package com.ssafy.boney.domain.loan.service;

import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoanScoreService {

    private final UserRepository userRepository;
    private final CreditScoreRepository creditScoreRepository;

    public ResponseEntity<?> checkCreditScore(Integer childId) {
        if (childId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "401",
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        User child = userRepository.findById(childId).orElse(null);
        if (child == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "401",
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        CreditScore score = creditScoreRepository.findByUser(child).orElse(null);
        if (score == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "404",
                    "message", "아이에 해당하는 신용 점수가 존재하지 않습니다."
            ));
        }

        boolean isLoanAllowed = score.getScore() >= 30;

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", isLoanAllowed ? "신용 점수가 30 이상입니다." : "신용 점수가 30 미만입니다.",
                "data", Map.of(
                        "is_loan_allowed", isLoanAllowed,
                        "credit_score", score.getScore()
                )
        ));
    }


}
