package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.ParentQuestHistoryResponse;
import com.ssafy.boney.domain.quest.service.ParentQuestHistoryService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quests/parent")
@RequiredArgsConstructor
public class ParentQuestHistoryController {

    private final ParentQuestHistoryService parentQuestHistoryService;

    // 부모 지난 퀘스트 조회
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPastQuests(
            @RequestAttribute("userId") Integer parentId
    ) {
        List<ParentQuestHistoryResponse> quests = parentQuestHistoryService.getPastQuests(parentId);

        if (quests.isEmpty()) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(404, "해당 보호자에게 등록된 지난 퀘스트가 없습니다.", null)
            );
        }

        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "지난 퀘스트 목록 조회에 성공했습니다.", data)
        );
    }
}