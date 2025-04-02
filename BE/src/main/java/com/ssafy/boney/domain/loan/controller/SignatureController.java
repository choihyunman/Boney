package com.ssafy.boney.domain.loan.controller;

import com.ssafy.boney.domain.loan.service.SignatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/loan/signature")
@RequiredArgsConstructor
public class SignatureController {

    private final SignatureService signatureService;

    @PostMapping("/{loanId}")
    public ResponseEntity<?> uploadSignature(@PathVariable Integer loanId,
                                             @RequestParam("file") MultipartFile signatureImage,
                                             HttpServletRequest request) {
        Integer parentId = (Integer) request.getAttribute("userId");
        if (parentId == null) {
            return ResponseEntity.status(401).body(Map.of("status", "401", "message", "유효한 액세스 토큰이 필요합니다."));
        }

        return signatureService.uploadSignature(loanId, signatureImage);
    }


}
