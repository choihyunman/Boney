package com.ssafy.boney.domain.user.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    // 로그인 버튼 클릭 -> 카카오 인증 페이지 이동
    @GetMapping("/login/kakao")
    public String kakaoLogin() {
        String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code";

        return kakaoAuthUrl;
    }

    // 인증 완료 후 리다이렉트 처리
    @GetMapping("/login/kakao/callback")
    public Map<String, String> kakaoLoginCallback(@RequestParam("code") String code) {
        Map<String, String> response = new HashMap<>();
        response.put("code", code);

        return response;
    }


}