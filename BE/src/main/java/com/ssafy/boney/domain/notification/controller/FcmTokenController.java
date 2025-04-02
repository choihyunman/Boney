package com.ssafy.boney.domain.notification.controller;

import com.ssafy.boney.domain.notification.dto.FcmTokenRequest;
import com.ssafy.boney.domain.notification.dto.FcmTokenResponse;
import com.ssafy.boney.domain.notification.service.FcmTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fcm")
@RequiredArgsConstructor
public class FcmTokenController {

    private final FcmTokenService fcmTokenService;

    // 토큰 등록 또는 갱신
    @PostMapping("/register")
    public ResponseEntity<FcmTokenResponse> registerToken(@RequestBody FcmTokenRequest request) {
        FcmTokenResponse response = fcmTokenService.registerFcmToken(request);
        return ResponseEntity.ok(response);
    }

    // 토큰 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteToken(@RequestParam Integer tokenId) {
        fcmTokenService.deleteFcmToken(tokenId);
        return ResponseEntity.ok("토큰이 성공적으로 삭제되었습니다.");
    }
}