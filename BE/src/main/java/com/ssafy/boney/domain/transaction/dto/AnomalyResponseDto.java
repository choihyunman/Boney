package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class AnomalyResponseDto {
    private Double score;
    private Boolean anomaly;
}
