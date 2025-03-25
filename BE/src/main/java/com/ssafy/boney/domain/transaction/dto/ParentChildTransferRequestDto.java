package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class ParentChildTransferRequestDto {
    private Integer childId;
    private long amount;
}
