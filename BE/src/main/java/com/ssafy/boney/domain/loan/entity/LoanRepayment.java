package com.ssafy.boney.domain.loan.entity;


import com.ssafy.boney.domain.transaction.entity.Transaction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "loan_repayment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanRepayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_repayment_id")
    private Integer loanRepaymentId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(name = "principal_amount", nullable = false)
    private Long principalAmount;

    @Column(name = "repayment_date")
    private LocalDateTime repaymentDate;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}