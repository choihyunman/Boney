package com.ssafy.boney.domain.transaction.controller;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.entity.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.service.TransactionService;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @GetMapping
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam int year, @RequestParam int month, @RequestParam(defaultValue = "all") String type,
            @AuthenticationPrincipal UserDetails userDetails) {

        int userId = Integer.parseInt(userDetails.getUsername());
        User user = userRepository.findById(userId).orElseThrow();
        Account account = accountRepository.findByUser(user).orElseThrow();

        transactionService.syncExternalTransactions(account.getAccountNumber(), year, month);
        List<TransactionResponseDto> data = transactionService.getTransactions(year, month, type);

        return ResponseEntity.ok(Map.of("status", "200", "message", "거래 내역 조회 성공", "data", data));
    }

}
