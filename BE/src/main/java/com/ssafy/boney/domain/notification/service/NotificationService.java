package com.ssafy.boney.domain.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.entity.FcmTokens;
import com.ssafy.boney.domain.notification.entity.Notification;
import com.ssafy.boney.domain.notification.entity.NotificationType;
import com.ssafy.boney.domain.notification.repository.FcmTokensRepository;
import com.ssafy.boney.domain.notification.repository.NotificationRepository;
import com.ssafy.boney.domain.notification.repository.NotificationTypeRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final FcmTokensRepository fcmTokensRepository;
    private final NotificationTypeRepository notificationTypeRepository;
    private final UserRepository userRepository;
    private final FirebaseMessaging firebaseMessaging;

    public void sendNotification(NotificationRequest requestDto) {
        // 사용자 조회
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));

        // 알림 타입 조회
        NotificationType notificationType = notificationTypeRepository.findById(requestDto.getNotificationTypeId())
                .orElseThrow(() -> new RuntimeException("알림의 타입이 일치하지 않습니다."));
        // 해당 사용자의 FCM 토큰 목록 조회
        List<FcmTokens> tokenList = fcmTokensRepository.findByUser(user);

        // 각 토큰으로 FCM 메시지 전송
        for (FcmTokens token : tokenList) {
            Message message = Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle("알림")
                            .setBody(requestDto.getMessage())
                            .build())
                    .build();

            try {
                String response = firebaseMessaging.send(message);
                System.out.println("Sent message: " + response);
            } catch (FirebaseMessagingException e) {
                e.printStackTrace();
            }
        }

        // 알림 내역 DB 저장
        Notification notification = Notification.builder()
                .user(user)
                .notificationType(notificationType)
                .message(requestDto.getMessage())
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .referenceId(requestDto.getReferenceId())
                .build();

        notificationRepository.save(notification);
    }
}