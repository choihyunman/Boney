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
public class FcmTokenResponse {

    private Integer tokenId;
    private Integer userId;
    private String fcmToken;
    private String deviceInfo;
    private LocalDateTime createdAt;

}
