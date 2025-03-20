package com.ssafy.boney.domain.transaction.controller;

import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * /api/v1/transaction GET 요청 처리
 */
@RestController
@RequestMapping("/api/v1/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactionHistory(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "all") String type
    ) {
        List<TransactionResponseDto> data = transactionService.getTransactions(year, month, type);
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "거래 내역 조회 성공",
                "data", data
        ));
    }
}
