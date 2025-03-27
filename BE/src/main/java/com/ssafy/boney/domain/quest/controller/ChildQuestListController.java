package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.ChildQuestResponse;
import com.ssafy.boney.domain.quest.service.ChildQuestListService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/quests/child")
@RequiredArgsConstructor
public class ChildQuestListController {

    private final ChildQuestListService childQuestListService;

    // 아이 : 진행 중인 퀘스트 조회
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChildOngoingQuests(
            @RequestAttribute("userId") Integer childId
    ) {
        // 진행 중 퀘스트 목록 조회
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
}