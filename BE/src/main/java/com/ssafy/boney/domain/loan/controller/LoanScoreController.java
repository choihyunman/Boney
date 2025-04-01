package com.ssafy.boney.domain.loan.controller;

import com.ssafy.boney.domain.loan.service.LoanScoreService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loan/child")
@RequiredArgsConstructor
public class LoanScoreController {

    private final LoanScoreService loanScoreService;

    //
    @GetMapping("/credit-score")
    public ResponseEntity<?> checkCreditScore(HttpServletRequest request) {
        Integer childId = (Integer) request.getAttribute("userId");
        return loanScoreService.checkCreditScore(childId);
    }


}
