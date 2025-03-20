package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public String registerUser(UserSignupRequest request) {
        // 이메일 중복 체크
        if (userRepository.findByUserEmail(request.getUserEmail()).isPresent()) {
            return "이미 가입된 이메일입니다.";
        }

        // 카카오 ID 중복 체크
        if (userRepository.findByKakaoId(request.getKakaoId()).isPresent()) {
            return "이미 가입된 카카오 계정입니다.";
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

        userRepository.save(newUser);
        return "회원가입 성공";
    }

}
