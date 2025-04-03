package com.ssafy.boney.domain.notification.service;

import com.ssafy.boney.domain.notification.dto.FcmTokenRequest;
import com.ssafy.boney.domain.notification.dto.FcmTokenResponse;
import com.ssafy.boney.domain.notification.entity.FcmTokens;
import com.ssafy.boney.domain.notification.repository.FcmTokensRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FcmTokenService {

    private final FcmTokensRepository fcmTokensRepository;
    private final UserRepository userRepository;

    public FcmTokenResponse registerFcmToken(FcmTokenRequest request) {
        // 사용자 조회
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));

        // 이미 해당 토큰이 등록되어 있는지 확인
        Optional<FcmTokens> existingTokenOpt = fcmTokensRepository.findByUserAndFcmToken(user, request.getFcmToken());
        FcmTokens tokenEntity;
        if (existingTokenOpt.isPresent()) {
            // 등록된 토큰이 있다면 기기 정보를 업데이트
            tokenEntity = existingTokenOpt.get();
            tokenEntity = FcmTokens.builder()
                    .tokenId(tokenEntity.getTokenId())
                    .user(user)
                    .fcmToken(request.getFcmToken())
                    .deviceInfo(request.getDeviceInfo())
                    .createdAt(LocalDateTime.now())
                    .build();
        } else {
            // 신규 토큰 등록
            tokenEntity = FcmTokens.builder()
                    .user(user)
                    .fcmToken(request.getFcmToken())
                    .deviceInfo(request.getDeviceInfo())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        tokenEntity = fcmTokensRepository.save(tokenEntity);

        return FcmTokenResponse.builder()
                .tokenId(tokenEntity.getTokenId())
                .userId(user.getUserId())
                .fcmToken(tokenEntity.getFcmToken())
                .deviceInfo(tokenEntity.getDeviceInfo())
                .createdAt(tokenEntity.getCreatedAt())
                .build();
    }

    public void deleteFcmToken(Integer tokenId) {
        if(!fcmTokensRepository.existsById(tokenId)) {
            throw new RuntimeException("해당 토큰이 존재하지 않습니다.");
        }
        fcmTokensRepository.deleteById(tokenId);
    }
}