package com.ssafy.boney.domain.quest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ApiQuestResponse<T> {
    private int status;
    private String message;
    private T data;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String errorCode;
}