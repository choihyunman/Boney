package com.ssafy.boney.domain.account.controller;

import com.ssafy.boney.domain.account.dto.AccountAuthRequest;
import com.ssafy.boney.domain.account.service.AccountAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountAuthController {

    private final AccountAuthService accountAuthService;

    @PostMapping("/auth")
    public ResponseEntity<?> authenticateAccount(@RequestBody AccountAuthRequest request) {

        return ResponseEntity.ok(accountAuthService.sendAuthRequest(request.getAccountNo()));
    }


}
