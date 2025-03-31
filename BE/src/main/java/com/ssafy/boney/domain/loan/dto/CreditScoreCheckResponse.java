package com.ssafy.boney.domain.loan.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class CreditScoreCheckResponse {

    private String status;
    private String message;
    private Map<String, Object> data;


}
