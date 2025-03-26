package com.ssafy.boney.domain.loan.controller;

import com.ssafy.boney.domain.loan.dto.LoanRequest;
import com.ssafy.boney.domain.loan.service.LoanService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loan")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    public ResponseEntity<?> requestLoan(@RequestBody LoanRequest request,
                                         HttpServletRequest httpRequest) {
        Integer childId = (Integer) httpRequest.getAttribute("userId");
        return loanService.createLoan(childId, request);
    }

    @GetMapping("/parent/requested")
    public ResponseEntity<?> getRequestedLoansForParent(HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");
        return loanService.getRequestedLoansByParent(parentId);
    }


}
