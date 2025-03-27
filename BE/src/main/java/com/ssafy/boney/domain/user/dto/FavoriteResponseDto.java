package com.ssafy.boney.domain.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FavoriteResponseDto {
    private Integer favoriteId;
    private Integer bankId;
    private String bankName;
    private String accountHolder;
    private String favoriteAccount;
    private LocalDateTime createdAt;
}