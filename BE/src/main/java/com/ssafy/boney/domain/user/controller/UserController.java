package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.service.UserService;
import com.ssafy.boney.global.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    private final JwtTokenProvider jwtTokenProvider;

    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
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
    public ResponseEntity<Map<String, Object>> getToken(@RequestParam("code") String code) {
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

        try {
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, requestEntity, Map.class
            );

            Map<String, Object> body = responseEntity.getBody();

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "status", 201,
                    "message", "카카오 엑세스 토큰이 발급되었습니다.",
                    "data", body
            ));
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "유효하지 않은 카카오 코드입니다."
            ));
        }
    }

    // 카카오 사용자 정보 조회
    @PostMapping("/login/kakao/user")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam("access_token") String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        // HTTP 요청 헤더 설정 (Bearer Token 포함)
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> responseEntity = restTemplate.exchange(userInfoUrl, HttpMethod.GET, requestEntity, Map.class);
            Map<String, Object> kakaoUser = responseEntity.getBody();

            if (kakaoUser == null || !kakaoUser.containsKey("id")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", 404,
                        "message", "카카오 사용자 정보를 찾을 수 없습니다."
                ));
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "status", 201,
                    "message", "카카오 사용자의 정보가 조회되었습니다.",
                    "data", kakaoUser
            ));
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "유효하지 않은 액세스 토큰입니다."
            ));
        }
    }
    
    // 회원 가입 API
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> registerUser(
            @RequestHeader(value = "Authorization", required = false) String token, // 🔹 Optional로 변경
            @RequestBody UserSignupRequest request) {
        return userService.registerUser(request);
    }

    // 회원 탈퇴 API (카카오 ID 기반)
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteUserByToken(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "message", "유효한 액세스 토큰이 필요합니다."
            ));
        }

        Claims claims = jwtTokenProvider.parseToken(token);
        Long kakaoId = claims.get("kakao_id", Long.class);

        return userService.deleteUserByKakaoId(kakaoId);
    }

    // JWT 토큰 발급 (카카오 ID)
    @PostMapping("/login/kakao/jwt")
    public ResponseEntity<Map<String, Object>> generateJwtToken(@RequestBody Map<String, Object> requestBody) {
        try {
            if (!requestBody.containsKey("kakao_id")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "status", 400,
                        "message", "요청 값이 잘못되었습니다."
                ));
            }

            Object kakaoIdObj = requestBody.get("kakao_id");
            if (!(kakaoIdObj instanceof Number)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "status", 400,
                        "message", "요청 값이 잘못되었습니다."
                ));
            }

            Long kakaoId = ((Number) kakaoIdObj).longValue();

            Optional<User> userOpt = userService.findByKakaoId(kakaoId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", 404,
                        "message", "해당 사용자를 찾을 수 없습니다."
                ));
            }

            User user = userOpt.get();

            String token = jwtTokenProvider.createToken(Map.of(
                    "user_id", user.getUserId(),
                    "created_at", user.getCreatedAt(),
                    "kakao_id", user.getKakaoId(),
                    "role", user.getRole().toString(),
                    "user_name", user.getUserName(),
                    "user_email", user.getUserEmail(),
                    "user_phone", user.getUserPhone(),
                    "user_gender", user.getUserGender().toString(),
                    "user_birth", user.getUserBirth().toString()
            ));

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "JWT 토큰 발급 완료",
                    "token", token
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "message", "요청 값이 잘못되었습니다."
            ));
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "status", 403,
                            "message", "이미 로그아웃된 사용자입니다."
                    ));
        }

        String jwt = token.substring(7);

        if (!jwtTokenProvider.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "status", 403,
                            "message", "이미 로그아웃된 사용자입니다."
                    ));
        }

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "로그아웃이 완료됐습니다."
        ));
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", 401,
                            "message", "JWT 토큰이 없거나 만료되었거나 위조되었습니다."
                    ));
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", 401,
                            "message", "JWT 토큰이 없거나 만료되었거나 위조되었습니다."
                    ));
        }

        Claims claims = jwtTokenProvider.parseToken(token);
        Long kakaoId = claims.get("kakao_id", Long.class);
        Optional<User> userOpt = userService.findByKakaoId(kakaoId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", 404,
                            "message", "토큰에는 존재하지만 DB에 등록된 사용자가 없습니다."
                    ));
        }

        User user = userOpt.get();

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "회원 등록 여부가 확인되었습니다.",
                "data", Map.of(
                        "is_registered", true,
                        "user_id", user.getUserId(),
                        "kakao_id", user.getKakaoId(),
                        "role", user.getRole().toString(),
                        "user_birth", user.getUserBirth().toString(),
                        "user_name", user.getUserName(),
                        "user_gender", user.getUserGender().toString(),
                        "user_email", user.getUserEmail(),
                        "user_phone", user.getUserPhone()
                )
        ));
    }


}
