package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.ChildQuestHistoryResponse;
import com.ssafy.boney.domain.quest.dto.ChildQuestResponse;
import com.ssafy.boney.domain.quest.dto.QuestChildDetailResponse;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.ChildQuestCompletionService;
import com.ssafy.boney.domain.quest.service.ChildQuestDetailService;
import com.ssafy.boney.domain.quest.service.ChildQuestHistoryService;
import com.ssafy.boney.domain.quest.service.ChildQuestListService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/children/quests")
@RequiredArgsConstructor
public class ChildQuestController {

    private final ChildQuestListService childQuestListService;
    private final ChildQuestHistoryService childQuestHistoryService;
    private final ChildQuestDetailService childQuestDetailService;
    private final ChildQuestCompletionService childQuestCompletionService;

    // 1. 아이 - 진행 중인 퀘스트 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChildOngoingQuests(
            @RequestAttribute("userId") Integer childId
    ) {
        List<ChildQuestResponse> quests = childQuestListService.getOngoingQuests(childId);

        if (quests.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(404, "진행 중인 퀘스트가 없습니다.", null));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "진행 중인 퀘스트 목록 조회 성공", data)
        );
    }


    // 2. 아이 - 지난 퀘스트 목록 조회
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChildPastQuests(
            @RequestAttribute("userId") Integer childId
    ) {
        List<ChildQuestHistoryResponse> quests = childQuestHistoryService.getPastQuests(childId);

        if (quests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "지난 퀘스트가 없습니다.", null));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);
        return ResponseEntity.ok(new ApiResponse<>(200, "지난 퀘스트 목록 조회 성공", data));
    }


    // 3. 아이 - 퀘스트 상세 조회
    @GetMapping("/{questId}")
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


    // 4. 아이 - 퀘스트 완료 요청
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
