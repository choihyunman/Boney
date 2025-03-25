package com.ssafy.boney.domain.transaction.controller;

import com.ssafy.boney.domain.transaction.dto.*;
import com.ssafy.boney.domain.transaction.service.TransferService;
import com.ssafy.boney.domain.user.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transfer")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    // 예금주 조회
    @GetMapping("/holder")
    public ResponseEntity<?> getHolder(@RequestParam("accountNo") String accountNo, HttpServletRequest request) {

        HolderCheckResponseDto response = transferService.getAccountHolder(accountNo);
        return ResponseEntity.status(200)
                .body(new ApiResponse(200, "예금주 조회 성공", response));
    }

}
