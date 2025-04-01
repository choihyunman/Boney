package com.ssafy.boney.domain.main.dto;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.quest.entity.Quest;
import lombok.Builder;
import lombok.Data;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ChildMainResponse {

    private String account_number;
    private String bank_name;
    private Long account_balance;
    private Long all_loan;
    private int credit_score;
    private double all_score;
    private List<Map<String, Object>> quests;

    public static ChildMainResponse of(Account account, Long balance, Long totalLoan, int score, double avgScore, Quest quest) {
        return ChildMainResponse.builder()
                .account_number(account.getAccountNumber())
                .bank_name(account.getBank().getBankName())
                .account_balance(balance)
                .all_loan(totalLoan)
                .credit_score(score)
                .all_score(avgScore)
                .quests(quest != null ? List.of(Map.of(
                        "questId", quest.getQuestId(),
                        "childName", quest.getParentChild().getChild().getUserName(),
                        "questTitle", quest.getQuestTitle(),
                        "questCategory", quest.getQuestCategory().getCategoryName(),
                        "questReward", quest.getQuestReward(),
                        "questStatus", quest.getQuestStatus().name(),
                        "endDate", quest.getEndDate().toLocalDate().toString()
                )) : List.of())
                .build();
    }


}
