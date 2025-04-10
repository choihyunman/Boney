package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;


// 송금 request dto
@Data
public class TransferRequest {
    private String sendPassword;
    private long amount;
    private String recipientBank;
    private String recipientAccountHolder;
    private String recipientAccountNumber;


}
