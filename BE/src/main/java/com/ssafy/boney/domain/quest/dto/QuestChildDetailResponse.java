package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestChildDetailResponse {
    private Integer questId;
    private String questTitle;
    private String questCategory;
    private LocalDateTime endDate;
    private Long questReward;
    private String questImgUrl;
}