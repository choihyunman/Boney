package com.ssafy.boney.domain.transaction.dto;

import lombok.Data;

@Data
public class ParentChildTransferResponse {
    private String accountNumber;
    private String childName;
}
