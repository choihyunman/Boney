package com.ssafy.boney.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Integer userId; // 알림 받을 유저 id
    private Integer notificationTypeId;
    private String message;
    private Integer referenceId;
}