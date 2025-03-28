package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.QuestChildDetailResponse;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.ChildQuestDetailService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class ChildQuestDetailController {

    private final ChildQuestDetailService childQuestDetailService;

    // 아이 퀘스트 상세 조회
    @GetMapping("/{questId}/child")
    public ResponseEntity<ApiResponse<QuestChildDetailResponse>> getChildQuestDetail(
            @RequestAttribute("userId") Integer childId,
            @PathVariable("questId") Integer questId
    ) {
        try {
            QuestChildDetailResponse responseDto = childQuestDetailService.getChildQuestDetail(childId, questId);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 상세 조회 성공", responseDto));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }
}
