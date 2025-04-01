package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.ChildQuestCompletionService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class ChildQuestCompletionController {

    private final ChildQuestCompletionService childQuestCompletionService;

    // 아이 퀘스트 완료 요청
    @PostMapping(value = "/{questId}/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> completeQuest(
            @RequestAttribute("userId") Integer childId,
            @PathVariable("questId") Integer questId,
            @RequestPart(value = "quest_img_url", required = false) MultipartFile questImage
    ) {
        try {
            childQuestCompletionService.requestQuestCompletion(childId, questId, questImage);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 완료 요청이 성공적으로 전송되었습니다.", null));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}