package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class ParentChildTransferResponseDto {
    private String accountNumber;
    private String childName;
}
