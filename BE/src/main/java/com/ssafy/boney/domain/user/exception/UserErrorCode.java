package com.ssafy.boney.domain.user.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode {
    CONFLICT(409, "이미 등록된 사용자입니다."),
    NOT_FOUND(404, "사용자를 찾을 수 없습니다."),
    FAVORITE_CONFLICT(409, "이미 즐겨찾기로 등록된 계좌입니다."),
    INVALID_ACCOUNT(404, "계좌 정보가 올바르지 않습니다.");

    private final int status;
    private final String message;
}