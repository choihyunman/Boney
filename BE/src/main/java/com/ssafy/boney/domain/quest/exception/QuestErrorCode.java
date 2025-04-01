package com.ssafy.boney.domain.quest.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum QuestErrorCode {

    QUEST_NOT_FOUND(404, "해당 퀘스트를 찾을 수 없습니다."),
    QUEST_LIST_NOT_FOUND(404, "등록된 퀘스트 목록이 없습니다."),
    CATEGORY_NOT_FOUND(404, "퀘스트 카테고리를 찾을 수 없습니다."),
    PARENT_NOT_FOUND(404, "보호자 정보를 찾을 수 없습니다."),
    PARENT_CHILD_RELATION_INVALID(404, "보호자와 아이의 관계가 올바르지 않습니다."),

    PARENT_ACCOUNT_NOT_FOUND(404, "보호자 계좌 정보를 찾을 수 없습니다."),
    CHILD_ACCOUNT_NOT_FOUND(404, "아이 계좌 정보를 찾을 수 없습니다."),

    INVALID_STATE_FOR_COMPLETION(400, "요청하신 작업을 진행할 수 없습니다."),
    INVALID_STATE_FOR_APPROVAL(400, "해당 퀘스트는 보상 대기 상태가 아닙니다."),
    DUPLICATE_COMPLETION_REQUEST(400, "이미 요청이 진행되었습니다."),

    PARENT_ONLY_ACTION(403, "해당 작업은 보호자만 수행할 수 있습니다."),

    INVALID_QUEST_STATUS(400, "요청한 퀘스트의 상태를 확인해 주세요."),

    IMAGE_UPLOAD_FAIL(500, "이미지 업로드에 실패했습니다."),
    INTERNAL_ERROR(500, "서버 내부 오류가 발생했습니다.");

    private final int status;
    private final String message;
}
