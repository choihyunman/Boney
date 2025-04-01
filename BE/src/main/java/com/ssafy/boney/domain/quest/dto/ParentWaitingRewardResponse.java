package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ParentWaitingRewardResponse {
    private Integer questId;
    private String questTitle;
    private String questCategory;
    private String childName;
    private Integer childId;
    private LocalDateTime endDate;
    private Long questReward;
    private String questStatus;
    private String questImgUrl;
}
