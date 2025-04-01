package com.ssafy.boney.domain.quest.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.NOT_FOUND)
public class QuestNotFoundException extends QuestException {

    public QuestNotFoundException(QuestErrorCode errorCode) {
        super(errorCode);
    }
}