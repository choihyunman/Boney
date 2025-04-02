package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class LoanRequest {
    @JsonProperty("loan_amount")
    private Long loanAmount;

    @JsonProperty("due_date")
    private LocalDateTime dueDate;

    @JsonProperty("signature")
    private String signature;

}
