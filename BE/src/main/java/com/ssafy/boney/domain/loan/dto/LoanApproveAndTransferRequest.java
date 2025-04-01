package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

@Getter
public class LoanApproveAndTransferRequest {
    @JsonProperty("loan_id")
    private Integer loanId;

    @JsonProperty("password")
    private String password;


}
