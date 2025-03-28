package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanRejectRequest {
    @JsonProperty("loan_id")
    private Integer loanId;


}
