package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanRepaymentRequest {
    @JsonProperty("loan_id")
    private Integer loanId;

    @JsonProperty("repayment_amount")
    private Long repaymentAmount;
    private String password;

}
