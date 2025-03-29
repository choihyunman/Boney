package com.ssafy.boney.domain.loan.controller;

import com.ssafy.boney.domain.loan.dto.*;
import com.ssafy.boney.domain.loan.service.LoanService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // 대출 세부 사항 조회
    @GetMapping("/{loanId}")
    public ResponseEntity<?> getLoanDetail(@PathVariable("loanId") Integer loanId,
                                           HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return loanService.getLoanDetail(loanId, userId);
    }

    // 대기 중인 대출 조회 api
    @GetMapping("/child/requested")
    public ResponseEntity<?> getRequestedLoansByChild(HttpServletRequest request) {
        Integer childId = (Integer) request.getAttribute("userId");
        return loanService.getRequestedLoansByChild(childId);
    }

    // 대기 중인 대출 제거 api
    @DeleteMapping("/child/requested/{loanId}")
    public ResponseEntity<?> deleteRequestedLoan(@PathVariable("loanId") Integer loanId,
                                                 HttpServletRequest request) {
        Integer childId = (Integer) request.getAttribute("userId");
        return loanService.deleteRequestedLoan(loanId, childId);
    }

    // 대출 상황 api
    @PostMapping("/repay")
    public ResponseEntity<?> repayLoan(@RequestBody LoanRepaymentRequest request,
                                       HttpServletRequest httpRequest) {
        Integer childId = (Integer) httpRequest.getAttribute("userId");
        return loanService.repayLoan(childId, request);
    }

    // 상환 완료된 대출 보기 (아이) api
    @GetMapping("/child/repaid")
    public ResponseEntity<?> getRepaidLoansByChild(HttpServletRequest request) {
        Integer childId = (Integer) request.getAttribute("userId");
        return loanService.getRepaidLoansByChild(childId);
    }

    // 상환 완료된 대출 보기 (부모) api
    @GetMapping("/parent/repaid")
    public ResponseEntity<?> getRepaidLoansByParent(HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");
        return loanService.getRepaidLoansByParent(parentId);
    }

    
}
