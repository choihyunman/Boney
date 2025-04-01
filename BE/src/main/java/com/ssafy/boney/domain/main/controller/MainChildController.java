package com.ssafy.boney.domain.main.controller;

import com.ssafy.boney.domain.main.service.MainChildService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/main")
@RequiredArgsConstructor
public class MainChildController {

    private final MainChildService mainChildService;

    // 자녀 메인 페이지 정보 조회
    @GetMapping("/child")
    public ResponseEntity<?> getMainPageForChild(HttpServletRequest request) {
        Integer childId = (Integer) request.getAttribute("userId");

        if (childId == null) {
            return ResponseEntity.status(401).body(
                    java.util.Map.of(
                            "status", "401",
                            "message", "유효한 액세스 토큰이 필요합니다."
                    )
            );
        }

        return mainChildService.getMainPage(childId);
    }


}
