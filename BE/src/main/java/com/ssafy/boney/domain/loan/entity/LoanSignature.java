package com.ssafy.boney.domain.loan.entity;

import com.ssafy.boney.domain.loan.entity.enums.SignerType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "loan_signature")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LoanSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signature_id")
    private Integer signatureId;

    @ManyToOne(fetch = FetchType.LAZY) // 변경: OneToOne → ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(name = "signature_url", nullable = false)
    private String signatureUrl;

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "signer_type", nullable = false)
    private SignerType signerType;


}
