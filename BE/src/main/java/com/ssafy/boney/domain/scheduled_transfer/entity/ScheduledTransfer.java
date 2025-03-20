package com.ssafy.boney.domain.scheduled_transfer.entity;

import com.google.cloud.storage.transfermanager.TransferStatus;
import com.ssafy.boney.domain.scheduled_transfer.entity.enums.TransferCycle;
import com.ssafy.boney.domain.scheduled_transfer.entity.enums.TransferWeekday;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_transfer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduledTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scheduled_transfer_id")
    private Integer scheduledTransferId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // DDL: parent_child_id INT NOT NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_child_id", nullable = false)
    private ParentChild parentChild;

    @Column(name = "transfer_amount", nullable = false)
    private Long transferAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_cycle", nullable = false)
    private TransferCycle transferCycle;

    @Column(name = "transfer_day")
    private Integer transferDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_weekday")
    private TransferWeekday transferWeekday;

    @Column(name = "transfer_memo", length = 100)
    private String transferMemo;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransferStatus status;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}