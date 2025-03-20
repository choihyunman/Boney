package com.ssafy.boney.domain.transaction.entity;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transaction")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account; // 거래한 계좌

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 거래한 사용자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_category_id", nullable = false)
    private TransactionCategory transactionCategory; // 거래 카테고리

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(name = "transaction_amount", nullable = false)
    private Long transactionAmount; // 거래 금액

    @Column(name = "transaction_content", length = 255)
    private String transactionContent; // 거래 내용

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionHashtag> transactionHashtags = new ArrayList<>();

}