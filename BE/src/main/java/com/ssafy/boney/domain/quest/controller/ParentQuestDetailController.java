package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.ParentQuestDetailResponse;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.ParentQuestDetailService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class ParentQuestDetailController {

    private final ParentQuestDetailService parentQuestDetailService;

    // 부모 퀘스트 상세 조회
    @GetMapping("/{questId}")
    public ResponseEntity<ApiResponse<ParentQuestDetailResponse>> getQuestDetail(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId
    ) {
        try {
            ParentQuestDetailResponse responseDto = parentQuestDetailService.getQuestDetail(parentId, questId);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 상세 조회에 성공했습니다.", responseDto));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }
}