package com.ssafy.boney.domain.transaction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_category_id")
    private Integer transactionCategoryId;  // PK

    @Column(name = "transaction_category_name", nullable = false, length = 100)
    private String transactionCategoryName; // 카테고리명

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom; // 사용자가 추가한 카테고리 여부

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}