package com.ssafy.boney.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_score")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)

public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "creditscore_id")
    private Integer creditScoreId;  // PK

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "score", nullable = false, columnDefinition = "INT DEFAULT 50")
    private Integer score;

    @Column(name = "updated_at", nullable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (score == null) {
            score = 50;
        }
    }


}