package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanApproveAndTransferRequest {
    @JsonProperty("loan_id")
    private Integer loanId;

    private String password;

    @JsonProperty("parent_signature")
    private String parentSignature;


}
