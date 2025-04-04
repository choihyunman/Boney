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

    @JsonProperty("child_signature")
    private String signature;

}
