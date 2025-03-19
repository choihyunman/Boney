package com.ssafy.boney.domain.transaction.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transaction_hashtag")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_hashtag_id")
    private Integer transactionHashtagId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction; // 거래

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hashtag_id", nullable = false)
    private Hashtag hashtag; // 해시태그
}
