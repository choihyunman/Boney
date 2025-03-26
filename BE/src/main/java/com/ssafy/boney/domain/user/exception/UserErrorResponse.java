package com.ssafy.boney.domain.user.exception;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class UserErrorResponse {
    private final int status;
    private final String message;

    public UserErrorResponse(UserErrorCode errorCode) {
        this.status = errorCode.getStatus();
        this.message = errorCode.getMessage();
    }

    public static UserErrorResponse of(UserErrorCode errorCode) {
        return new UserErrorResponse(errorCode);
    }
}