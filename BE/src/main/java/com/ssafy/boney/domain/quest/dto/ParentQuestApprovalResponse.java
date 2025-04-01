package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParentQuestApprovalResponse {
    private String bankName;
    private String accountNumber;
    private long amount;
    private String transferCreatedAt;

    private String questTitle;
    private String questMessage;
    private String finishDate;
    private String approvalDate;
}