package com.ssafy.boney.domain.user.dto;

import lombok.Data;

@Data
public class FavoriteRequest {
    private String bankName;
    private String accountHolder;
    private String favoriteAccount;
}