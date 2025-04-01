package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssafy.boney.domain.user.entity.enums.Role;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

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

        // 연관된 엔티티 삭제는 User 엔티티에 설정된 cascade = CascadeType.ALL, orphanRemoval = true 덕분에 자동 처리됨
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "회원 탈퇴가 완료되었습니다."
        ));
    }
}
