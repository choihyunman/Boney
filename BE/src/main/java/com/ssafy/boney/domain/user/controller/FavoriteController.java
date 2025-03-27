package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.FavoriteRequestDto;
import com.ssafy.boney.domain.user.dto.FavoriteResponseDto;
import com.ssafy.boney.domain.user.service.FavoriteService;
import com.ssafy.boney.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    // 계좌 즐겨찾기 등록
    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponseDto>> registerFavorite(@RequestBody FavoriteRequestDto request,
                                                                             HttpServletRequest httpRequest) {
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        FavoriteResponseDto responseDto = favoriteService.registerFavorite(userId, request.getBankId(), request.getFavoriteAccount());
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기 등록 성공", responseDto));
    }
}