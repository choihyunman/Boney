package com.ssafy.boney.domain.main.controller;

import com.ssafy.boney.domain.main.service.MainParentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/main")
@RequiredArgsConstructor
public class ParentMainController {

    private final MainParentService mainParentService;

    @GetMapping("/parent")
    public ResponseEntity<?> getMainPageForParent(HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");

        if (parentId == null) {
            return ResponseEntity.status(401).body(
                    java.util.Map.of("status", "401", "message", "유효한 액세스 토큰이 필요합니다.")
            );
        }

        return mainParentService.getMainPage(parentId);
    }


}
