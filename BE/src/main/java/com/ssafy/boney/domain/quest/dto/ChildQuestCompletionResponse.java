package com.ssafy.boney.domain.quest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChildQuestCompletionResponse {
    private String categoryName;
    private String categoryTitle;
    private Long amount;
    private LocalDateTime finishDate;
}
