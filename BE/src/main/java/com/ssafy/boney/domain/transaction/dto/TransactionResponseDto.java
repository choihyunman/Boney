package com.ssafy.boney.domain.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 거래 내역 조회 결과를 반환할 DTO
 */
@Getter
@AllArgsConstructor
public class TransactionResponseDto {
    private Long transactionId;
    private LocalDateTime transactionDate;
    private String transactionContent;
    private Long transactionAmount;
    private String transactionType;
    private String transactionCategoryName;
    private List<String> hashtags;
    private Long transactionAfterBalance;
}
