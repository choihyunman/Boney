package com.ssafy.boney.domain.transaction.controller;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
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

@RestController
@RequestMapping("/api/v1/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;  // 추가
    private final AccountRepository accountRepository;

    @GetMapping
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "all") String type,
            @AuthenticationPrincipal UserDetails userDetails) {

        // JWT에서 얻은 이메일로 사용자 조회 (수정 부분)
        String userEmail = userDetails.getUsername();
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 사용자 엔티티로 계좌 조회 (이 부분을 이렇게 수정)
        Account account = accountRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("계좌를 찾을 수 없습니다."));

        // 서비스 호출
        transactionService.syncExternalTransactions(account.getAccountNumber(), year, month);
        List<TransactionResponseDto> data = transactionService.getTransactions(year, month, type, user);

        // 정상 응답 반환
        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "거래 내역 조회 성공",
                "data", data
        ));
    }

    // ★ 추가: 단일 거래 상세 조회
    @GetMapping("{transactionId}")
    public ResponseEntity<?> getTransactionDetail(
            @PathVariable Integer transactionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 로그인 사용자 정보 확인
        String userEmail = userDetails.getUsername();
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // Service 호출
        TransactionResponseDto detailDto = transactionService.getTransactionDetail(transactionId, user);

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "data", detailDto
        ));
    }
}
