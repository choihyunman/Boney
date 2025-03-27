package com.ssafy.boney.domain.quest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class QuestNotFoundException extends RuntimeException {
    public QuestNotFoundException(String message) {
        super(message);
    }
}