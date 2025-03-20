package com.ssafy.boney.domain.user.controller;

import com.ssafy.boney.domain.user.dto.ApiResponse;
import com.ssafy.boney.domain.user.dto.ChildRegisterRequest;
import com.ssafy.boney.domain.user.service.ParentChildService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/parent/child")
@RequiredArgsConstructor
public class ParentChildController {

    private final ParentChildService parentChildService;

    // 보호자 아이 등록
    @PostMapping
    public ResponseEntity<?> registerChild(@RequestBody ChildRegisterRequest request,
                                           HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        parentChildService.registerChild(parentId, request.getUserEmail(), request.getUserPhone());
        return ResponseEntity.status(201)
                .body(new ApiResponse(201, "자녀 등록이 완료되었습니다."));
    }


}
