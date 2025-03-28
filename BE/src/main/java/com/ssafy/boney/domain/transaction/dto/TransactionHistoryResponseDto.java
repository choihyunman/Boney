package com.ssafy.boney.domain.transaction.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TransactionHistoryResponseDto {
    @JsonProperty("Header")
    private Header header;

    @JsonProperty("REC")
    private Rec rec;

    @Data
    public static class Header {
        private String responseCode;
        private String responseMessage;
        // 기타 Header 필드
    }

    @Data
    public static class Rec {
        private String transactionUniqueNo;
        private String transactionDate;
        private String transactionTime;
        private String transactionType;
        private String transactionTypeName;
        private String transactionAccountNo;
        private String transactionBalance;
        private String transactionAfterBalance;
        private String transactionSummary;
        private String transactionMemo;
    }
}
