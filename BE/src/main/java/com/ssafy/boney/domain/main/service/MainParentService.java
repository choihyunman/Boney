package com.ssafy.boney.domain.main.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.main.dto.ParentMainResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MainParentService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CreditScoreRepository creditScoreRepository;
    private final LoanRepository loanRepository;
    private final QuestRepository questRepository;
    private final ParentChildRepository parentChildRepository;
    private final BankingApiService bankingApiService;

    public ResponseEntity<?> getMainPage(Integer parentId) {
        // 1. 보호자 조회
        User parent = userRepository.findById(parentId).orElse(null);
        if (parent == null) {
            return ResponseEntity.status(404).body(Map.of("status", 404, "message", "해당 보호자가 없습니다."));
        }

        // 2. 보호자 계좌 조회
        Account parentAccount = accountRepository.findByUser(parent).orElse(null);
        if (parentAccount == null) {
            return ResponseEntity.status(403).body(Map.of("status", 403, "message", "해당 보호자의 계좌 정보가 없습니다."));
        }

        // 3. 실시간 잔액 조회
        Long balance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());

        // 4. 자녀 목록 조회
        List<ParentChild> children = parentChildRepository.findByParent(parent);
        List<Map<String, Object>> childInfoList = new ArrayList<>();

        for (ParentChild relation : children) {
            User child = relation.getChild();
            CreditScore score = creditScoreRepository.findByUser(child).orElse(null);

            // 대출 잔액 계산
            List<Loan> loans = loanRepository.findByParentChild(relation);
            long childLoan = loans.stream()
                    .mapToLong(loan -> loan.getLastAmount() != null ? loan.getLastAmount() : 0L)
                    .sum();

            childInfoList.add(Map.of(
                    "child_id", child.getUserId(),
                    "child_name", child.getUserName(),
                    "credit_score", score != null ? score.getScore() : 0,
                    "total_child_loan", childLoan
            ));
        }

        // 5. 퀘스트 정보
        List<Quest> allQuests = new ArrayList<>();
        for (ParentChild relation : children) {
            allQuests.addAll(questRepository.findOngoingQuestsByChild(relation.getChild().getUserId()));
        }

        // IN_PROGRESS 중 가장 빠른 마감일 1개
        Optional<Quest> soonestQuest = allQuests.stream()
                .filter(q -> q.getQuestStatus().name().equals("IN_PROGRESS"))
                .min(Comparator.comparing(Quest::getEndDate));

        // WAITING_REWARD 중 가장 오래된 퀘스트 1개
        Optional<Quest> oldestWaitingQuest = allQuests.stream()
                .filter(q -> q.getQuestStatus().name().equals("WAITING_REWARD"))
                .min(Comparator.comparing(Quest::getCreatedAt));

        List<Map<String, Object>> questSummary = new ArrayList<>();
        for (Optional<Quest> optQuest : List.of(soonestQuest, oldestWaitingQuest)) {
            optQuest.ifPresent(q -> questSummary.add(Map.of(
                    "quest_id", q.getQuestId(),
                    "quest_child", q.getParentChild().getChild().getUserName(),
                    "quest_title", q.getQuestTitle(),
                    "quest_reward", q.getQuestReward(),
                    "end_date", q.getEndDate().toLocalDate().toString(),
                    "quest_status", q.getQuestStatus().name()
            )));
        }

        // 6. 응답 반환
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "부모 메인 페이지 정보가 조회되었습니다.",
                "data", ParentMainResponse.of(
                        parent.getUserName(),
                        parentAccount.getAccountNumber(),
                        parentAccount.getBank().getBankName(),
                        balance,
                        childInfoList,
                        questSummary
                )
        ));
    }


}
