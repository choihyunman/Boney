package com.ssafy.boney.domain.quest.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ParentQuestCreateResponse {
    private String childName;
    private String questCategory;
    private String questTitle;
    private Long questReward;
    private LocalDate endDate;
    private String questMessage;
}
