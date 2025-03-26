package com.ssafy.boney.domain.user.exception;

public class UserConflictException extends RuntimeException {

    private final UserErrorCode errorCode;

    public UserConflictException(UserErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public UserErrorCode getErrorCode() {
        return errorCode;
    }
}