package com.ssafy.boney.domain.transaction.controller;

import com.ssafy.boney.domain.transaction.dto.*;
import com.ssafy.boney.domain.transaction.service.TransferService;
import com.ssafy.boney.global.dto.ApiResponse;
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

        HolderCheckResponse response = transferService.getAccountHolder(accountNo);
        return ResponseEntity.status(200)
                .body(new ApiResponse(200, "예금주 조회 성공", response));
    }


    // 잔액 조회
    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getBalance(HttpServletRequest request) {
        Integer senderUserId = (Integer) request.getAttribute("userId");
        BalanceResponse response = transferService.getSenderBalance(senderUserId);
        return ResponseEntity.ok(response);
    }


    // 송금 진행
    @PostMapping
    public ResponseEntity<TransferResponse> send(@RequestBody TransferRequest request,
                                                 HttpServletRequest httpRequest) {
        Integer senderUserId = (Integer) httpRequest.getAttribute("userId");
        TransferResponse response = transferService.processTransfer(request, senderUserId);
        return ResponseEntity.ok(response);
    }


    // 부모 → 자식 직접 송금 (새로운 기능)
    @PostMapping("/allowance")
    public ResponseEntity<?> sendToChild(@RequestBody ParentChildTransferRequest request, HttpServletRequest httpRequest) {
        Integer parentUserId = (Integer) httpRequest.getAttribute("userId");
        ParentChildTransferResponse response = transferService.processParentChildTransfer(request, parentUserId);
        return ResponseEntity.ok(new ApiResponse(200, "용돈이 성공적으로 송금되었습니다.", response));
    }
}
