package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    private final String tokenUrl = "https://kauth.kakao.com/oauth/token";

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

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

    // 카카오 로그인 토큰 발급
    @PostMapping("/login/kakao/token")
    public ResponseEntity<Map> getToken(@RequestParam("code") String code) {
        RestTemplate restTemplate = new RestTemplate();

        // 요청 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        // HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // HTTP 요청 엔터티 생성
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        // 카카오 API 요청 (토큰 발급)
        ResponseEntity<Map> responseEntity = restTemplate.exchange(
                tokenUrl, HttpMethod.POST, requestEntity, Map.class
        );

        // 응답 반환 (Access Token 포함)
        return ResponseEntity.ok(responseEntity.getBody());
    }

    // 카카오 사용자 정보 조회
    @PostMapping("/login/kakao/user")
    public ResponseEntity<Map> getUserInfo(@RequestParam("access_token") String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        // HTTP 요청 헤더 설정 (Bearer Token 포함)
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        // 카카오 API 요청 (사용자 정보 가져오기)
        ResponseEntity<Map> responseEntity = restTemplate.exchange(userInfoUrl, HttpMethod.GET, requestEntity, Map.class);

        // 응답 반환 (사용자 정보 포함)
        return ResponseEntity.ok(responseEntity.getBody());

    }

    // 회원 가입 API
    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody UserSignupRequest request) {
        String result = userService.registerUser(request);
        return ResponseEntity.ok(result);
    }


}