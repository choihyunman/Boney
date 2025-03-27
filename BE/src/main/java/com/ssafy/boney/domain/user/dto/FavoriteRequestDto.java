package com.ssafy.boney.domain.user.dto;

import lombok.Data;

@Data
public class FavoriteRequestDto {
    private Integer bankId;
    private String favoriteAccount;
}