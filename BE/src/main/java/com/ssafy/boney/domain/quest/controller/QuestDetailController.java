package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.QuestDetailResponse;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.QuestDetailService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class QuestDetailController {

    private final QuestDetailService questDetailService;

    @GetMapping("/{questId}")
    public ResponseEntity<ApiResponse<QuestDetailResponse>> getQuestDetail(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId
    ) {
        try {
            QuestDetailResponse responseDto = questDetailService.getQuestDetail(parentId, questId);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 상세 조회에 성공했습니다.", responseDto));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }
}