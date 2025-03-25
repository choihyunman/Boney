package com.ssafy.boney.domain.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// 송금 response dto
@Data
@AllArgsConstructor
public class TransferResponseDto {
    private String status;
    private String message;
    private TransferData data;
}