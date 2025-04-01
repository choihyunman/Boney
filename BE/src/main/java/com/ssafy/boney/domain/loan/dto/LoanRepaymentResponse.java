package com.ssafy.boney.domain.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepaymentResponse {

    @JsonProperty("loan_id")
    private Long loanId;

    @JsonProperty("due_date")
    private LocalDate dueDate;

    @JsonProperty("repayment_amount")
    private int repaymentAmount;

    @JsonProperty("loan_amount")
    private int totalLoanAmount;

    @JsonProperty("last_amount")
    private int lastAmount;

    @JsonProperty("loan_status")
    private String loanStatus;

    @JsonProperty("child_credit_score")
    private int childCreditScore;


}
