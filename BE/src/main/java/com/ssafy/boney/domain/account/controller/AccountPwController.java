package com.ssafy.boney.domain.account.controller;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.global.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountPwController {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/password")
    public ResponseEntity<Map<String, Object>> updateAccountPassword(
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

        Integer userId = (Integer) httpRequest.getAttribute("userId");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "사용자를 찾을 수 없습니다."
            ));
        }

        String accountNumber = requestBody.get("account_number");
        String rawPassword = requestBody.get("send_password");

        if (accountNumber == null || rawPassword == null || accountNumber.isBlank() || rawPassword.isBlank()) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", 400,
                    "message", "요청 값이 잘못되었습니다."
            ));
        }

        Optional<Account> accountOpt = accountRepository.findByAccountNumber(accountNumber);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "계좌를 찾을 수 없습니다."
            ));
        }

        Account account = accountOpt.get();
        if (!account.getUser().getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", 403,
                    "message", "계좌 소유자가 아닙니다."
            ));
        }

        // 비밀번호 암호화 후 저장
        String encodedPassword = passwordEncoder.encode(rawPassword);
        account.setAccountPassword(encodedPassword);
        accountRepository.save(account);

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "계좌 비밀번호가 성공적으로 변경되었습니다."
        ));
    }


}
