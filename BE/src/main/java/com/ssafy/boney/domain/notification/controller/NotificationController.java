package com.ssafy.boney.domain.notification.controller;

import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.dto.NotificationResponse;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.global.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(@RequestAttribute("userId") Integer userId) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByUser(userId);
        ApiResponse<List<NotificationResponse>> response = new ApiResponse<>(200, "알림 목록 조회 성공", notifications);
        return ResponseEntity.ok(response);
    }

    // 단일 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Object>> markNotificationAsRead(@PathVariable Integer notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        ApiResponse<Object> response = new ApiResponse<>(200, "알림이 읽음 처리되었습니다.", null);
        return ResponseEntity.ok(response);
    }

    // 모든 알림 읽음 처리
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllNotificationsAsRead(@RequestAttribute("userId") Integer userId) {
        notificationService.markAllNotificationsAsRead(userId);
        ApiResponse<Object> response = new ApiResponse<>(200, "모든 알림이 읽음 처리되었습니다.", null);
        return ResponseEntity.ok(response);
    }
}