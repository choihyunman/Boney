package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChildQuestHistoryResponse {
    private Integer questId;
    private String questTitle;
    private String questCategory;
    private Long questReward;
    private String questStatus;
    private LocalDateTime endDate;
}
