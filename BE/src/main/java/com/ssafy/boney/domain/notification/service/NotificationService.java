package com.ssafy.boney.domain.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.dto.NotificationResponse;
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
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new RuntimeException("알림 타입이 일치하지 않습니다."));

        // FCM 토큰 목록 조회 및 FCM 메시지 전송
        List<FcmTokens> tokenList = fcmTokensRepository.findByUser(user);
        for (FcmTokens token : tokenList) {
            Message message = Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(requestDto.getNotificationTitle())
                            .setBody(requestDto.getNotificationContent())
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
                .notificationTitle(requestDto.getNotificationTitle())
                .notificationContent(requestDto.getNotificationContent())
                .notificationAmount(requestDto.getNotificationAmount())
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .referenceId(requestDto.getReferenceId())
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotificationsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream().map(n -> NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUser().getUserId())
                .notificationTypeCode(n.getNotificationType().getTypeCode())
                .notificationTitle(n.getNotificationTitle())
                .notificationContent(n.getNotificationContent())
                .notificationAmount(n.getNotificationAmount())
                .readStatus(n.getReadStatus())
                .createdAt(n.getCreatedAt())
                .referenceId(n.getReferenceId())
                .build()).collect(Collectors.toList());
    }

    // 단일 알림 읽음 처리
    public void markNotificationAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다."));
        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }

    // 모든 알림 읽음 처리
    public void markAllNotificationsAsRead(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(notifications);
    }
}