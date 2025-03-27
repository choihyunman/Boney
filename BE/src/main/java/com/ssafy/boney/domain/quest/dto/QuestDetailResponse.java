package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestDetailResponse {
    private Integer questId;
    private String questTitle;
    private String questCategory;
    private String childName;
    private LocalDateTime endDate;
    private Long questReward;
}