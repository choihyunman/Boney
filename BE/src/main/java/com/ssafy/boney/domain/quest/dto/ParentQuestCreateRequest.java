package com.ssafy.boney.domain.quest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ParentQuestCreateRequest {
    private Integer parentChildId;
    private Integer questCategoryId;
    private String questTitle;
    private Long questReward;
    private String questMessage;
    private LocalDate endDate;

}
