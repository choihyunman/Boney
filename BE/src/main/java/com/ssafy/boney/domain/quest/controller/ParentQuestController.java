package com.ssafy.boney.domain.quest.controller;


import com.ssafy.boney.domain.quest.dto.*;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.service.*;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.service.UserService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/parents/quests")
@RequiredArgsConstructor
public class ParentQuestController {

    private final ParentQuestChildService parentQuestChildService;
    private final UserService userService;
    private final ParentQuestService parentQuestService;
    private final ParentQuestDetailService parentQuestDetailService;
    private final ParentQuestHistoryService parentQuestHistoryService;
    private final ParentQuestListService parentQuestListService;
    private final ParentQuestWaitingRewardService parentQuestWaitingRewardService;
    private final ParentQuestApprovalService parentQuestApprovalService;


    // 1. 보호자 - 퀘스트 아이 목록 조회
    @GetMapping("/children")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQuestChildren(
            @RequestAttribute("userId") Integer parentId) {
        User parent = userService.findById(parentId);
        List<ParentQuestChildResponse> children = parentQuestChildService.getChildrenForQuest(parent);
        if (children.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "아이 목록을 찾을 수 없습니다.", null));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("children", children);
        return ResponseEntity.ok(new ApiResponse<>(200, "아이 목록 조회 성공", data));
    }

    // 2. 퀘스트 생성
    @PostMapping
    public ResponseEntity<ApiResponse<ParentQuestCreateResponse>> createQuest(
            @RequestAttribute("userId") Integer parentId,
            @RequestBody ParentQuestCreateRequest requestDto) {
        try {
            ParentQuestCreateResponse responseDto = parentQuestService.createQuest(parentId, requestDto);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 생성에 성공했습니다.", responseDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, "퀘스트 생성 실패. 입력된 데이터를 확인해주세요.", null));
        }
    }

    // 3. 보호자 퀘스트 상세 조회
    @GetMapping("/{questId}")
    public ResponseEntity<ApiResponse<ParentQuestDetailResponse>> getQuestDetail(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId) {
        try {
            ParentQuestDetailResponse responseDto = parentQuestDetailService.getQuestDetail(parentId, questId);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 상세 조회에 성공했습니다.", responseDto));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }


    // 4. 퀘스트 삭제
    @DeleteMapping("/{questId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuest(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId) {
        try {
            parentQuestDetailService.deleteQuest(parentId, questId);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트가 성공적으로 삭제되었습니다.", null));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }


    // 5. 보호자 진행 중 퀘스트 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOngoingQuests(
            @RequestAttribute("userId") Integer parentId) {
        List<ParentQuestListResponse> quests = parentQuestListService.getOngoingQuests(parentId);
        if (quests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 보호자에게 등록된 아이의 미션이 없습니다.", null));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);
        return ResponseEntity.ok(new ApiResponse<>(200, "진행 중인 퀘스트 목록 조회에 성공했습니다.", data));
    }


    // 6. 보호자 지난 퀘스트 조회
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPastQuests(
            @RequestAttribute("userId") Integer parentId) {
        List<ParentQuestHistoryResponse> quests = parentQuestHistoryService.getPastQuests(parentId);
        if (quests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 보호자에게 등록된 지난 퀘스트가 없습니다.", null));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);
        return ResponseEntity.ok(new ApiResponse<>(200, "지난 퀘스트 목록 조회에 성공했습니다.", data));
    }


    // 7. 보상 대기 퀘스트 상세 조회
    @GetMapping("/{questId}/waiting-reward")
    public ResponseEntity<ApiResponse<?>> getWaitingRewardQuestDetail(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "보상 대기 퀘스트 상세 조회 성공",
                    parentQuestWaitingRewardService.getWaitingRewardQuest(parentId, questId)));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }


    // 8. 퀘스트 성공 처리 + 보상 송금
    @PostMapping("/{questId}/approval")
    public ResponseEntity<ApiResponse<ParentQuestApprovalResponse>> approveQuest(
            @RequestAttribute("userId") Integer parentId,
            @PathVariable("questId") Integer questId,
            @RequestBody ParentQuestApprovalRequest approvalRequest
    ) {
        try {
            ParentQuestApprovalResponse responseDto = parentQuestApprovalService.approveQuestCompletion(parentId, questId, approvalRequest);
            return ResponseEntity.ok(new ApiResponse<>(200, "퀘스트 보상이 성공적으로 송금되었습니다.", responseDto));
        } catch (QuestNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
