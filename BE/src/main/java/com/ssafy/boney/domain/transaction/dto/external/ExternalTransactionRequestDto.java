package com.ssafy.boney.domain.transaction.dto.external;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 외부 API에 POST 요청 시 사용할 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalTransactionRequestDto {
    private Header Header;
    private String accountNo;
    private String startDate; // YYYYMMDD
    private String endDate;   // YYYYMMDD
    private String transactionType; // "A" (전체 고정)
    private String orderByType;     // 옵션, 없으면 null

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Header {
        private String apiName;
        private String transmissionDate;
        private String transmissionTime;
        private String institutionCode;
        private String fintechAppNo;
        private String apiServiceCode;
        private String institutionTransactionUniqueNo;
        private String apiKey;
        private String userKey;
    }
}
