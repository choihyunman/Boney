package com.ssafy.boney.domain.notification.controller;

import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.dto.NotificationResponse;
import com.ssafy.boney.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 사용자 알림 목록 조회 (생성일 내림차순)
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@RequestParam Integer userId) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // 단일 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Integer notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok("알림이 읽음 처리되었습니다.");
    }

    // 모든 알림 읽음 처리
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(@RequestParam Integer userId) {
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok("모든 알림이 읽음 처리되었습니다.");
    }
}