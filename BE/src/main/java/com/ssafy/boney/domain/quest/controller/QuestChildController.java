package com.ssafy.boney.domain.quest.controller;

import com.ssafy.boney.domain.quest.dto.QuestChildResponseDto;
import com.ssafy.boney.domain.quest.service.QuestChildService;
import com.ssafy.boney.global.dto.ApiResponse;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class QuestChildController {

    private final QuestChildService questChildService;
    private final UserService userService;

    // 보호자 아이 목록 조회
    @GetMapping("/children")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQuestChildren(
            @RequestAttribute("userId") Integer parentId) {

        User parent = userService.findById(parentId);
        List<QuestChildResponseDto> children = questChildService.getChildrenForQuest(parent);

        if (children.isEmpty()) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(404, "아이 목록을 찾을 수 없습니다.", null)
            );
        }

        Map<String, Object> data = new HashMap<>();
        data.put("children", children);
        return ResponseEntity.ok(new ApiResponse<>(200, "자녀 목록 조회 성공", data));
    }


}