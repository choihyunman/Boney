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
            return ResponseEntity.status(404).body(Map.of(
                    "status", "404",
                    "message", "해당 보호자가 없습니다."
            ));
        }

        // 2. 보호자 계좌 조회
        Account parentAccount = accountRepository.findByUser(parent).orElse(null);
        if (parentAccount == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", "403",
                    "message", "해당 보호자의 계좌 정보가 없습니다."
            ));
        }

        // 3. 실시간 잔액 조회
        Long balance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());

        // 4. 자녀 목록 조회
        List<ParentChild> relations = parentChildRepository.findByParent(parent);
        List<Map<String, Object>> childList = new ArrayList<>();

        for (ParentChild relation : relations) {
            User child = relation.getChild();
            CreditScore creditScore = creditScoreRepository.findByUser(child).orElse(null);
            List<Loan> loans = loanRepository.findByParentChild(relation);

            long totalLoan = loans.stream()
                    .mapToLong(l -> l.getLastAmount() != null ? l.getLastAmount() : 0L)
                    .sum();

            childList.add(Map.of(
                    "child_id", child.getUserId(),
                    "child_name", child.getUserName(),
                    "credit_score", creditScore != null ? creditScore.getScore() : 0,
                    "total_child_loan", totalLoan
            ));
        }

        // 5. 퀘스트 2건 (IN_PROGRESS 가장 빠른 + WAITING_REWARD 가장 오래된)
        List<Quest> allQuests = new ArrayList<>();
        for (ParentChild relation : relations) {
            allQuests.addAll(questRepository.findOngoingQuestsByChild(relation.getChild().getUserId()));
        }

        Optional<Quest> soonestInProgress = allQuests.stream()
                .filter(q -> q.getQuestStatus().name().equals("IN_PROGRESS"))
                .min(Comparator.comparing(Quest::getEndDate));

        Optional<Quest> oldestWaiting = allQuests.stream()
                .filter(q -> q.getQuestStatus().name().equals("WAITING_REWARD"))
                .min(Comparator.comparing(Quest::getCreatedAt));

        List<Map<String, Object>> questList = new ArrayList<>();
        for (Optional<Quest> q : List.of(soonestInProgress, oldestWaiting)) {
            q.ifPresent(quest -> questList.add(Map.of(
                    "quest_id", quest.getQuestId(),
                    "quest_title", quest.getQuestTitle(),
                    "quest_child", quest.getParentChild().getChild().getUserName(),
                    "quest_status", quest.getQuestStatus().name(),
                    "quest_category", quest.getQuestCategory().getCategoryName(),
                    "quest_reward", quest.getQuestReward(),
                    "end_date", quest.getEndDate().toLocalDate().toString()
            )));
        }

        // 6. 최종 응답 구성
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "부모 메인 페이지 정보가 조회되었습니다.",
                "data", ParentMainResponse.of(
                        parent.getUserName(),
                        parentAccount.getAccountNumber(),
                        "버니은행", // 또는 parentAccount.getBank().getBankName()
                        balance,
                        childList,
                        questList
                )
        ));
    }


}
