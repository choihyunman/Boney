package com.ssafy.boney.domain.quest.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum QuestErrorCode {
    QUEST_NOT_FOUND(404, "해당 퀘스트를 찾을 수 없습니다.");

    private final int status;
    private final String message;
}