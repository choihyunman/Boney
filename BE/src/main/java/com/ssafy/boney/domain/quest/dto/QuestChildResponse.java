package com.ssafy.boney.domain.quest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuestChildResponse {
    private Integer parentChildId;
    private Integer childId;
    private String childName;
}