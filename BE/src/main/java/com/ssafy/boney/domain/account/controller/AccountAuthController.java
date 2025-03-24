package com.ssafy.boney.domain.account.controller;

import com.ssafy.boney.domain.account.dto.AccountAuthRequest;
import com.ssafy.boney.domain.account.dto.AccountVerifyRequest;
import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.entity.Bank;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.repository.BankRepository;
import com.ssafy.boney.domain.account.service.AccountAuthService;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.global.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountAuthController {

    private final AccountAuthService accountAuthService;
    private final AccountRepository accountRepository;
    private final BankRepository bankRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/auth")
    public ResponseEntity<?> authenticateAccount(@RequestBody AccountAuthRequest request) {

        return ResponseEntity.ok(accountAuthService.sendAuthRequest(request.getAccountNo()));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyAccountAuthCode(@RequestBody AccountVerifyRequest request) {
        return ResponseEntity.ok(accountAuthService.verifyAuthCode(request.getAccountNo(), request.getAuthCode()));
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createAccount(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "401",
                    "message", "인증에 실패했습니다."
            ));
        }

        try {
            Map<String, Object> result = accountAuthService.createDemandDepositAccount();

            Map<String, Object> rec = (Map<String, Object>) result.get("REC");
            if (rec == null || !rec.containsKey("accountNo")) {
                return ResponseEntity.status(400).body(Map.of(
                        "status", "400",
                        "message", "요청 값이 잘못되었습니다."
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "status", "200",
                    "message", "계좌 생성에 성공했습니다.",
                    "data", Map.of(
                            "accountNo", rec.get("accountNo")
                    )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", "400",
                    "message", "요청 값이 잘못되었습니다."
            ));
        }
    }


    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerAccount(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest httpRequest) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증에 실패했습니다."
            ));
        }

        String jwt = token.substring(7);
        if (!jwtTokenProvider.validateToken(jwt)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증에 실패했습니다."
            ));
        }

        // 🔎 사용자 식별
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "사용자를 찾을 수 없습니다."
            ));
        }

        String accountNo = requestBody.get("accountNo");
        if (accountNo == null || accountNo.isBlank()) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", 400,
                    "message", "요청 값이 잘못되었습니다."
            ));
        }

        User user = userOpt.get();
        Bank bank = bankRepository.findByBankName("OneCoin")
                .orElseGet(() -> bankRepository.save(new Bank(null, "OneCoin")));

        Account account = Account.builder()
                .user(user)
                .bank(bank)
                .accountNumber(accountNo)
                .accountPassword(null)
                .accountBalance(0L)
                .createdAt(LocalDateTime.now())
                .build();

        accountRepository.save(account);

        return ResponseEntity.status(201).body(Map.of(
                "status", 201,
                "message", "계좌가 성공적으로 등록되었습니다.",
                "data", Map.of(
                        "accountNo", account.getAccountNumber(),
                        "account_balance", account.getAccountBalance(),
                        "bank_id", bank.getBankId()
                )
        ));
    }


}
