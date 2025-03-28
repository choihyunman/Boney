package com.ssafy.boney.domain.user.dto;

import com.ssafy.boney.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ChildResponse {
    private Integer userId;
    private String userName;
    private LocalDate userBirth;
    private String userGender;
    private String userPhone;
    private Integer score;
    private String totalRemainingLoan;
    private LocalDateTime createdAt;
    private String bankName;
    private String accountNumber;
}