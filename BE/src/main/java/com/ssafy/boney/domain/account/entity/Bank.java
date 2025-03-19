package com.ssafy.boney.domain.account.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Bank")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bank_id")
    private Integer bankId;

    @Column(name = "bank_name", nullable = false, length = 25)
    private String bankName;
}