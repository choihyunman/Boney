package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class TransferData {
    private String bankName;
    private String accountNumber;
    private long amount;
    private String createdAt;
}