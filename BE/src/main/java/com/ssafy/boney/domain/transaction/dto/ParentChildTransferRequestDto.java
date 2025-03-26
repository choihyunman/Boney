package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class ParentChildTransferRequestDto {
    private String sendPassword;
    private Integer childId;
    private long amount;
}
