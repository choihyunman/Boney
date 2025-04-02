package com.ssafy.boney.domain.loan.service;

import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.LoanSignature;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.loan.repository.LoanSignatureRepository;
import com.ssafy.boney.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SignatureService {

    private final LoanRepository loanRepository;
    private final LoanSignatureRepository loanSignatureRepository;
    private final S3Service s3Service;

    public ResponseEntity<?> uploadSignature(Integer loanId, MultipartFile signatureImage) {
        Loan loan = loanRepository.findById(loanId).orElse(null);
        if (loan == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "message", "해당 대출 정보를 찾을 수 없습니다."
            ));
        }

        // S3에 저장
        String imageUrl = s3Service.uploadFile(signatureImage, "signatures");

        // DB에 저장
        LoanSignature signature = LoanSignature.builder()
                .loan(loan)
                .signatureUrl(imageUrl)
                .signedAt(LocalDateTime.now())
                .build();

        loanSignatureRepository.save(signature);

        return ResponseEntity.ok(Map.of(
                "status", "200",
                "message", "전자 서명이 성공적으로 저장되었습니다.",
                "data", Map.of("signature_url", imageUrl)
        ));
    }


}
