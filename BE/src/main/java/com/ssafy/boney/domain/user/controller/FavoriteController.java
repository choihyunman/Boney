package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.FavoriteRequestDto;
import com.ssafy.boney.domain.user.dto.FavoriteResponseDto;
import com.ssafy.boney.domain.user.service.FavoriteService;
import com.ssafy.boney.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        FavoriteResponseDto responseDto = favoriteService.registerFavorite(userId, request.getBankName(), request.getAccountHolder(), request.getFavoriteAccount());
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기 등록 성공", responseDto));
    }

    // 계좌 즐겨찾기 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponseDto>>> getFavoriteList(HttpServletRequest httpRequest) {
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        List<FavoriteResponseDto> favorites = favoriteService.getFavoriteList(userId);
        if (favorites.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(404, "즐겨찾기로 등록된 계좌 정보가 존재하지 않습니다.", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기로 등록된 계좌 조회 성공", favorites));
    }
}
