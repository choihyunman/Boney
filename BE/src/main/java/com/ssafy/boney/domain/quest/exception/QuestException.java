package com.ssafy.boney.domain.quest.exception;

import lombok.Getter;

@Getter
public class QuestException extends RuntimeException {

    private final QuestErrorCode errorCode;

    public QuestException(QuestErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}