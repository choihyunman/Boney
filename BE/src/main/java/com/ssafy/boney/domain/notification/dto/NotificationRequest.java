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
    private Integer userId;               // 알림 받을 유저 id
    private Integer notificationTypeId;   // 알림 타입 (예: 1: TRANSFER_RECEIVED, 2: QUEST_REGISTERED, ...)
    private String notificationTitle;     // 알림 타이틀
    private String notificationContent;   // 알림 내용
    private Long notificationAmount;      // 알림 금액 (선택)
    private Integer referenceId;          // 관련 레코드 id (예: 거래 id, 퀘스트 id 등)
}