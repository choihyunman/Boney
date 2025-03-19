package com.ssafy.boney.domain.loan.entity;


import com.ssafy.boney.domain.loan.entity.enums.LoanStatus;
import com.ssafy.boney.domain.user.entity.ParentChild;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "loan")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_id")
    private Integer loanId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_child_id", nullable = false)
    private ParentChild parentChild;

    @Column(name = "loan_amount", nullable = false)
    private Long loanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LoanStatus status;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "repaid_at")
    private LocalDateTime repaidAt;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "last_amount")
    private Long lastAmount;
}