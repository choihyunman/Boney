package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        // 데이터베이스 저장
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
        Optional<User> user = userRepository.findByKakaoId(kakaoId);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", 404,
                            "message", "사용자를 찾을 수 없습니다."
                    ));
        }

        userRepository.deleteByKakaoId(kakaoId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of(
                        "status", 200,
                        "message", "회원탈퇴를 완료했습니다."
                ));
    }

}
