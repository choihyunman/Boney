package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
// 계좌 주인 체크 dto
public class HolderCheckResponse {
    private String accountHolderName;
}
