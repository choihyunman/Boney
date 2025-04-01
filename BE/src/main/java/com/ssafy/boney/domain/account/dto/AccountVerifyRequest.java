package com.ssafy.boney.domain.account.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountVerifyRequest {
    private String accountNo;
    private String authCode;


}
