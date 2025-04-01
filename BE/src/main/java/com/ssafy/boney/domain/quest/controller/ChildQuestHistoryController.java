package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.ChildQuestHistoryResponse;
import com.ssafy.boney.domain.quest.service.ChildQuestHistoryService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/quests/child")
@RequiredArgsConstructor
public class ChildQuestHistoryController {

    private final ChildQuestHistoryService childQuestHistoryService;

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
}