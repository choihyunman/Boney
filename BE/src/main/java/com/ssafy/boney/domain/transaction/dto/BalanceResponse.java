package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
// 잔액 조회 dto
public class BalanceResponse {
    private long balance;
    private String accountNumber;
    private String bankName;
}