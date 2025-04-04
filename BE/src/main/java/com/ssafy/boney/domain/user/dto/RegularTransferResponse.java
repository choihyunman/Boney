package com.ssafy.boney.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegularTransferResponse {
    private Long scheduledAmount;
    private String scheduledFrequency;
    private Integer startDate;
}
