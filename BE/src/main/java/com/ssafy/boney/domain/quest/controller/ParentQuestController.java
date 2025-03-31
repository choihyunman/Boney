package com.ssafy.boney.domain.quest.controller;


import com.ssafy.boney.domain.quest.dto.ParentQuestCreateRequest;
import com.ssafy.boney.domain.quest.service.ParentQuestService;
import com.ssafy.boney.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class ParentQuestController {

    private final ParentQuestService parentQuestService;

    // 퀘스트 생성
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createQuest(
            @RequestAttribute("userId") Integer parentId,
            @RequestBody ParentQuestCreateRequest requestDto
    ) {
        try {
            parentQuestService.createQuest(parentId, requestDto);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "퀘스트 생성에 성공했습니다.", null)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(404, e.getMessage(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(400, "퀘스트 생성 실패. 입력된 데이터를 확인해주세요.", null)
            );
        }
    }
}