package com.ssafy.boney.domain.user.dto;

import lombok.Data;

@Data
public class FavoriteRequestDto {
    private String bankName;
    private String favoriteAccount;
}