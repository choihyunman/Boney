package com.ssafy.boney.domain.transaction.exception;

import com.google.firebase.ErrorCode;
import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

    private final TransactionErrorCode errorCode;

    public CustomException(TransactionErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}