package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssafy.boney.domain.user.entity.enums.Role;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Value("${kakao.admin-key}")
    private String kakaoAdminKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByKakaoId(Long kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }

    @Transactional(readOnly = true)
    public User findById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> registerUser(UserSignupRequest request) {
        // 이메일 중복 체크
        if (userRepository.findByUserEmail(request.getUserEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", 400,
                            "message", "이미 존재하는 이메일입니다."
                    ));
        }

        // 카카오 ID 중복 체크
        if (userRepository.findByKakaoId(request.getKakaoId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", 400,
                            "message", "이미 존재하는 카카오 ID입니다."
                    ));
        }

        // 사용자 생성 (Builder 패턴 사용)
        User newUser = User.builder()
                .userEmail(request.getUserEmail())
                .userBirth(request.getUserBirth())
                .userPhone(request.getUserPhone())
                .userName(request.getUserName())
                .role(request.getRole())
                .kakaoId(request.getKakaoId())
                .userGender(request.getUserGender())
                .createdAt(LocalDateTime.now()) // 회원가입 시간 설정
                .build();

        // 사용자가 CHILD일 경우, CreditScore Entity에 데이터 추가
        if (newUser.getRole() == Role.CHILD) {
            CreditScore creditScore = CreditScore.builder()
                    .user(newUser)
                    .score(50)
                    .updatedAt(LocalDateTime.now())
                    .build();
            newUser.setCreditScore(creditScore);
        }

        User savedUser = userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "status", 201,
                        "message", "회원가입이 완료되었습니다.",
                        "data", Map.of(
                                "userId", savedUser.getUserId(),
                                "userName", savedUser.getUserName(),
                                "role", savedUser.getRole().toString(),
                                "userEmail", savedUser.getUserEmail(),
                                "kakaoId", savedUser.getKakaoId()
                        )
                ));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> deleteUserByKakaoId(Long kakaoId) {
        Optional<User> userOpt = userRepository.findByKakaoId(kakaoId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", 404,
                    "message", "회원 정보를 찾을 수 없습니다."
            ));
        }

        User user = userOpt.get();

        // 1. 카카오 연결 끊기 (unlink)
        try {
            String unlinkUrl = "https://kapi.kakao.com/v1/user/unlink";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "KakaoAK " + kakaoAdminKey);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("target_id_type", "user_id");
            body.add("target_id", String.valueOf(kakaoId));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(unlinkUrl, request, String.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "message", "카카오 연결 끊기에 실패했습니다.",
                    "error", e.getMessage()
            ));
        }

        // 2. DB에서 사용자 삭제
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "회원 탈퇴 및 카카오 연결 해제가 완료되었습니다."
        ));
    }


}
