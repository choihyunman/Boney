package com.ssafy.boney.domain.main.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.main.dto.ChildMainResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MainChildService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CreditScoreRepository creditScoreRepository;
    private final LoanRepository loanRepository;
    private final BankingApiService bankingApiService;
    private final QuestRepository questRepository;

    public ResponseEntity<?> getMainPage(Integer childId) {
        // 1. 자녀 조회
        User child = userRepository.findById(childId).orElse(null);
        if (child == null) {
            return ResponseEntity.status(404).body(Map.of("status", 404, "message", "해당 자녀가 없습니다."));
        }

        // 2. 계좌 조회
        Account account = accountRepository.findByUser(child).orElse(null);
        if (account == null) {
            return ResponseEntity.status(403).body(Map.of("status", 403, "message", "해당 자녀의 계좌 정보가 없습니다."));
        }

        // 3. 실시간 계좌 잔액 조회
        Long realTimeBalance = bankingApiService.getAccountBalance(account.getAccountNumber());

        // 4. 신용 점수 조회
        CreditScore creditScore = creditScoreRepository.findByUser(child).orElse(null);
        if (creditScore == null) {
            return ResponseEntity.status(402).body(Map.of("status", 402, "message", "신용 점수 정보를 찾을 수 없습니다."));
        }

        // 5. 전체 평균 신용 점수 (소수 둘째 자리에서 반올림)
        List<CreditScore> allScores = creditScoreRepository.findAll();
        double avgScore = allScores.stream()
                .mapToInt(CreditScore::getScore)
                .average()
                .orElse(0.0);
        avgScore = Math.round(avgScore * 100.0) / 100.0;

        // 6. 전체 대출 잔액
        List<Loan> loans = new ArrayList<>();
        for (ParentChild relation : child.getParents()) {
            loans.addAll(loanRepository.findByParentChild(relation));
        }
        long totalLoanBalance = loans.stream()
                .mapToLong(loan -> loan.getLastAmount() != null ? loan.getLastAmount() : 0L)
                .sum();

        // 7. 마감이 임박한 IN_PROGRESS 퀘스트 1건
        List<Quest> inProgressQuests = questRepository.findOngoingQuestsByChild(childId).stream()
                .filter(q -> q.getQuestStatus().name().equals("IN_PROGRESS"))
                .sorted(Comparator.comparing(Quest::getEndDate))
                .toList();
        Quest nearestQuest = inProgressQuests.isEmpty() ? null : inProgressQuests.get(0);

        // 8. 응답 반환
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "메인 페이지 점수가 조회되었습니다.",
                "data", ChildMainResponse.of(account, realTimeBalance, totalLoanBalance, creditScore.getScore(), avgScore, nearestQuest)
        ));
    }

}
