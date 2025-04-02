package com.ssafy.boney.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Integer notificationId;
    private Integer userId;
    private String notificationTypeCode;
    private String message;
    private Boolean readStatus;
    private LocalDateTime createdAt;
    private Integer referenceId;
}
