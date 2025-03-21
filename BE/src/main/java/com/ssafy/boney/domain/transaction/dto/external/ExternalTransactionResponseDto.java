package com.ssafy.boney.domain.transaction.dto.external;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 외부 API 응답 시 사용할 응답 DTO (필요한 필드만 포함)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalTransactionResponseDto {
    private Header Header;
    private REC REC;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Header {
        private String responseCode;
        private String responseMessage;
        private String apiName;
        private String transmissionDate;
        private String transmissionTime;
        private String institutionCode;
        private String apiKey;
        private String apiServiceCode;
        private String institutionTransactionUniqueNo;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class REC {
        private String totalCount;
        private List<ExternalTransaction> list;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExternalTransaction {
        private String transactionUniqueNo;
        private String transactionDate;  // YYYYMMDD
        private String transactionTime;  // HHMMSS
        private String transactionType;  // "1" 입금, "2" 출금
        private String transactionTypeName;
        private String transactionAccountNo;
        private String transactionBalance;
        private String transactionAfterBalance;
        private String transactionSummary;
        private String transactionMemo;
    }
}
