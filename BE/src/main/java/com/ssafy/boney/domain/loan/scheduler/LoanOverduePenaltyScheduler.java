package com.ssafy.boney.domain.loan.scheduler;

import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.enums.LoanStatus;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanOverduePenaltyScheduler {

    private final LoanRepository loanRepository;
    private final CreditScoreRepository creditScoreRepository;

    /**
     * 2분마다 실행되는 스케줄러
     * 기한이 지난 대출이 존재할 경우 신용 점수를 10점씩 감점 (최저 0점)
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정
    @Transactional
    public void applyMonthlyOverduePenalties() {
        LocalDateTime now = LocalDateTime.now();

        List<Loan> overdueLoans = loanRepository.findAll().stream()
                .filter(loan -> loan.getStatus() == LoanStatus.APPROVED)
                .filter(loan -> loan.getDueDate().isBefore(now)) // 마감기한 초과
                .filter(loan -> {
                    LocalDateTime last = loan.getLastPenalizedAt();
                    return last == null || last.plusMonths(1).isBefore(now);
                })
                .toList();

        for (Loan loan : overdueLoans) {
            User child = loan.getParentChild().getChild();
            CreditScore creditScore = creditScoreRepository.findByUser(child).orElse(null);
            if (creditScore == null) continue;

            int currentScore = creditScore.getScore();
            if (currentScore <= 0) continue;

            int newScore = Math.max(0, currentScore - 10);
            creditScore.setScore(newScore);
            loan.setLastPenalizedAt(now);

            log.info("📉 대출 ID {} / 자녀 ID {}: 신용 점수 {} → {}", loan.getLoanId(), child.getUserId(), currentScore, newScore);
        }
    }


}
