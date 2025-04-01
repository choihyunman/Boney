package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanTransferRequest {
    @JsonProperty("loan_id")
    private Integer loanId;

    @JsonProperty("loan_amount")
    private Long loanAmount;


}
