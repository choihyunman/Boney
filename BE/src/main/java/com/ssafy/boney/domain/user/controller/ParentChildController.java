package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.global.dto.ApiResponse;
import com.ssafy.boney.domain.user.dto.ChildRegisterRequest;
import com.ssafy.boney.domain.user.dto.ChildResponse;
import com.ssafy.boney.domain.user.service.ParentChildService;
import com.ssafy.boney.global.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parent/child")
@RequiredArgsConstructor
public class ParentChildController {

    private final ParentChildService parentChildService;
    private final JwtTokenProvider jwtTokenProvider;

    // 보호자 아이 등록
    @PostMapping
    public ResponseEntity<?> registerChild(@RequestBody ChildRegisterRequest request,
                                           HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        parentChildService.registerChild(parentId, request.getUserEmail(), request.getUserPhone());
        return ResponseEntity.status(201)
                .body(new ApiResponse(201, "자녀 등록이 완료되었습니다.", null));
    }

    // 보호자 아이 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChildResponse>>> getChildren(HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");

        List<ChildResponse> children = parentChildService.getChildrenByParentId(parentId);
        ApiResponse<List<ChildResponse>> response = new ApiResponse<>(200, "아이 목록 조회에 성공했습니다.", children);
        return ResponseEntity.ok(response);
    }
}