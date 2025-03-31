package com.ssafy.boney.domain.user.exception;

public class UserNotFoundException extends RuntimeException {

    private final UserErrorCode errorCode;

    public UserNotFoundException(UserErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public UserErrorCode getErrorCode() {
        return errorCode;
    }
}