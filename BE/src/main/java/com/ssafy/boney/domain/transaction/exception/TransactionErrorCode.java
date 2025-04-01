package com.ssafy.boney.domain.transaction.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum TransactionErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다."),
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "계좌를 찾을 수 없습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호를 다시 입력해 주세요."),
    INSUFFICIENT_BALANCE(HttpStatus.FORBIDDEN, "계좌 잔액이 부족합니다."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다.");

    private final HttpStatus status;
    private final String message;

    TransactionErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}