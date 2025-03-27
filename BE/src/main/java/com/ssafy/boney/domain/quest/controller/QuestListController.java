package com.ssafy.boney.domain.quest.controller;


import com.ssafy.boney.domain.quest.dto.QuestListParentResponse;
import com.ssafy.boney.domain.quest.service.QuestListService;
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
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class QuestListController {

    private final QuestListService questListService;

    // 부모 퀘스트 목록 조회
    @GetMapping("/parent/list")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOngoingQuests(
            @RequestAttribute("userId") Integer parentId
    ) {
        List<QuestListParentResponse> quests = questListService.getOngoingQuests(parentId);

        if (quests.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(404, "해당 보호자에게 등록된 아이의 미션이 없습니다.", null));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("quests", quests);
        return ResponseEntity.ok(new ApiResponse<>(200, "진행 중인 퀘스트 목록 조회에 성공했습니다.", data));
    }
}
