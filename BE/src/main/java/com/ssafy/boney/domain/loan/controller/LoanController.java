package com.ssafy.boney.domain.loan.controller;

import com.ssafy.boney.domain.loan.dto.LoanApproveRequest;
import com.ssafy.boney.domain.loan.dto.LoanRejectRequest;
import com.ssafy.boney.domain.loan.dto.LoanRequest;
import com.ssafy.boney.domain.loan.dto.LoanTransferRequest;
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

    // 대출 승인 상태로 변경 api
    @PostMapping("/approve")
    public ResponseEntity<?> approveLoan(@RequestBody LoanApproveRequest request,
                                         HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        return loanService.approveLoan(request, parentId);
    }

    // 대출 요청 거절 api
    @PostMapping("/reject")
    public ResponseEntity<?> rejectLoan(@RequestBody LoanRejectRequest request,
                                        HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        return loanService.rejectLoan(request, parentId);
    }

    // 대출 송금 api
    @PostMapping("/transfer")
    public ResponseEntity<?> transferLoanAmount(@RequestBody LoanTransferRequest request,
                                                HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        return loanService.transferLoanAmount(request, parentId);
    }

    // 진행 중인 대출 조회 api - 부모
    @GetMapping("/parent/approved")
    public ResponseEntity<?> getApprovedLoans(HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");
        return loanService.getApprovedLoansByParent(parentId);
    }



}
