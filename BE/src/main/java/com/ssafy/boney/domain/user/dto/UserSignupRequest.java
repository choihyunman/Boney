package com.ssafy.boney.domain.user.dto;

import com.ssafy.boney.domain.user.entity.enums.Gender;
import com.ssafy.boney.domain.user.entity.enums.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserSignupRequest {
    private String userName;
    private LocalDate userBirth;
    private Gender userGender;
    private String userPhone;
    private String userEmail;
    private Long kakaoId;
    private Role role;

}
