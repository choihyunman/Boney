package com.ssafy.boney.domain.user.dto;

import com.ssafy.boney.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChildResponse {
    private Integer userId;
    private String userName;
    private LocalDate userBirth;
    private String userGender;
    private String userPhone;
    private Integer score;
    private String totalRemainingLoan;
    private LocalDateTime createdAt;

    @Builder
    public ChildResponse(User child, Integer score, String totalRemainingLoan) {
        this.userId = child.getUserId();
        this.userName = child.getUserName();
        this.userBirth = child.getUserBirth();
        this.userGender = child.getUserGender().toString();
        this.userPhone = child.getUserPhone();
        this.score = score;
        this.totalRemainingLoan = totalRemainingLoan;
        this.createdAt = child.getCreatedAt();
    }


}

