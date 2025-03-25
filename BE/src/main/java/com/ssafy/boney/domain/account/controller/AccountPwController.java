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

    // null 확인 api
    @PostMapping("/password/check")
    public ResponseEntity<Map<String, Object>> checkAccountPasswordNull(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> requestBody) {

        // JWT 누락
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증되지 않은 요청입니다."
            ));
        }

        // JWT 검증 실패
        String jwt = token.substring(7);
        if (!jwtTokenProvider.validateToken(jwt)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증되지 않은 요청입니다."
            ));
        }

        // 요청 필드 검증
        String accountNumber = requestBody.get("account_number");
        if (accountNumber == null || accountNumber.isBlank()) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", 400,
                    "message", "account_number는 필수이며, 올바른 형식이어야 합니다."
            ));
        }

        // 계좌 존재 여부 확인
        Optional<Account> accountOpt = accountRepository.findByAccountNumber(accountNumber);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "해당 계좌를 찾을 수 없습니다."
            ));
        }

        Account account = accountOpt.get();
        boolean isPasswordNull = (account.getAccountPassword() == null);

        if (isPasswordNull) {
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "계좌는 아직 비밀번호가 설정되지 않았습니다.",
                    "data", Map.of("isPasswordNull", true)
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "계좌에 비밀번호가 설정되어 있습니다.",
                    "data", Map.of("isPasswordNull", false)
            ));
        }
    }

    // 앱 비밀번호 검증
    @PostMapping("/password/verify")
    public ResponseEntity<Map<String, Object>> verifyAccountPassword(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest httpRequest) {

        // JWT 검증
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증되지 않은 요청입니다."
            ));
        }

        String jwt = token.substring(7);
        if (!jwtTokenProvider.validateToken(jwt)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "인증되지 않은 요청입니다."
            ));
        }

        // 사용자 조회
        Integer userId = (Integer) httpRequest.getAttribute("userId");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "사용자를 찾을 수 없습니다."
            ));
        }

        // 비밀번호 유효성 검사
        String sendPassword = requestBody.get("send_password");
        if (sendPassword == null || sendPassword.isBlank()) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", 400,
                    "message", "send_password는 필수이며, 올바른 형식이어야 합니다."
            ));
        }

        // 계좌 조회 (1인 1계좌)
        User user = userOpt.get();
        Optional<Account> accountOpt = accountRepository.findByUser(user);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "해당 계좌를 찾을 수 없습니다."
            ));
        }

        Account account = accountOpt.get();
        String storedPassword = account.getAccountPassword();

        // 비밀번호 설정 여부 확인
        if (storedPassword == null) {
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "계좌에 비밀번호가 설정되어 있지 않습니다.",
                    "data", Map.of("isPasswordNull", true)
            ));
        }

        // 비밀번호 일치 여부 판단
        boolean isMatched = passwordEncoder.matches(sendPassword, storedPassword);
        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", isMatched ? "계좌 비밀번호가 일치합니다." : "계좌 비밀번호가 일치하지 않습니다.",
                "data", Map.of("isMatched", isMatched)
        ));
    }


}
