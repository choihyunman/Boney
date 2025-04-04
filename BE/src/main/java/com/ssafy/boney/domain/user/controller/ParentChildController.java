package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.user.dto.ChildrenDetailResponse;
import com.ssafy.boney.global.dto.ApiResponse;
import com.ssafy.boney.domain.user.dto.ChildRegisterRequest;
import com.ssafy.boney.domain.user.dto.ChildResponse;
import com.ssafy.boney.domain.user.service.ParentChildService;
import com.ssafy.boney.global.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    // 아이 상세 조회
    @GetMapping("/{childId}")
    public ResponseEntity<ApiResponse<ChildrenDetailResponse>> getAllowanceSchedule(@PathVariable Integer childId,
                                                                                    HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");
        try {
            ChildrenDetailResponse detail = parentChildService.getChildRegularTransferDetail(parentId, childId);
            return ResponseEntity.ok(new ApiResponse<>(200, "해당 부모의 정기 용돈 송금 내역을 조회하였습니다.", detail));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 부모의 정기 용돈 송금 내역이 없습니다.", null));
        }
    }
}