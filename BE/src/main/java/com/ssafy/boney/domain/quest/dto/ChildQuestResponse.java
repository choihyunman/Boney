package com.ssafy.boney.domain.quest.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ChildQuestResponse {
    private Integer questId;
    private String questTitle;
    private String questCategory;
    private Long questReward;
    private String questStatus;
    private LocalDateTime endDate;
}