package com.ssafy.boney.domain.transaction.entity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "transaction_content")  // DB 테이블명
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_content_id")
    private Integer id;

    @Column(name = "content_name", nullable = false, unique = true)
    private String contentName;  // 가맹점명 혹은 \"입금\" 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_transaction_category_id", nullable = false)
    private TransactionCategory defaultTransactionCategory;
}
