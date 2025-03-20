package com.ssafy.boney.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChildRegisterRequest {
    private String userEmail;
    private String userPhone;
}
