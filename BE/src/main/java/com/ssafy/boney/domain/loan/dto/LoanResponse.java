package com.ssafy.boney.domain.loan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class LoanResponse {
    private String parentName;
    private String childName;
    private Long loanAmount;
    private LocalDateTime dueDate;
    private String loanStatus;

}
