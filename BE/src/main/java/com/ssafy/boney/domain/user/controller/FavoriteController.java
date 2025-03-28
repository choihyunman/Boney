package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.FavoriteDeleteRequest;
import com.ssafy.boney.domain.user.dto.FavoriteRequest;
import com.ssafy.boney.domain.user.dto.FavoriteResponse;
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
    public ResponseEntity<ApiResponse<FavoriteResponse>> registerFavorite(@RequestBody FavoriteRequest request,
                                                                          HttpServletRequest httpRequest) {
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        FavoriteResponse responseDto = favoriteService.registerFavorite(userId, request.getBankName(), request.getAccountHolder(), request.getFavoriteAccount());
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기 등록 성공", responseDto));
    }

    // 계좌 즐겨찾기 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getFavoriteList(HttpServletRequest httpRequest) {
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        List<FavoriteResponse> favorites = favoriteService.getFavoriteList(userId);
        if (favorites.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(404, "즐겨찾기로 등록된 계좌 정보가 존재하지 않습니다.", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기로 등록된 계좌 조회 성공", favorites));
    }

    // 계좌 즐겨찾기 삭제
    @DeleteMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> deleteFavorite(@RequestBody FavoriteDeleteRequest request,
                                                                        HttpServletRequest httpRequest) {
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        FavoriteResponse responseDto = favoriteService.deleteFavorite(userId, request.getFavoriteId());
        return ResponseEntity.ok(new ApiResponse<>(200, "즐겨찾기 계좌가 성공적으로 삭제되었습니다.", responseDto));
    }
}
