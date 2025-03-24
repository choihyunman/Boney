package com.ssafy.boney.domain.account.controller;

import com.ssafy.boney.domain.account.dto.AccountAuthRequest;
import com.ssafy.boney.domain.account.dto.AccountVerifyRequest;
import com.ssafy.boney.domain.account.service.AccountAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountAuthController {

    private final AccountAuthService accountAuthService;

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


}
