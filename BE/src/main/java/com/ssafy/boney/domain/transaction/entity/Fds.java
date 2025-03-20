package com.ssafy.boney.domain.transaction.entity;


import com.ssafy.boney.domain.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fds")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Fds {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fds_id")
    private Integer fdsId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "fds_reason", nullable = false, length = 200)
    private String fdsReason;
}