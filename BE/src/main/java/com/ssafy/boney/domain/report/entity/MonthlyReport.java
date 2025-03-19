package com.ssafy.boney.domain.report.entity;


import com.ssafy.boney.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_report")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(name = "report_month", nullable = false)
    private LocalDate reportMonth;

    @Column(name = "total_income", nullable = false)
    private Long totalIncome;

    @Column(name = "total_expense", nullable = false)
    private Long totalExpense;

    @Column(name = "category_expense", columnDefinition = "JSON", nullable = false)
    private String categoryExpense;

    @Column(name = "quest_completed", nullable = false)
    private Integer questCompleted;

    @Column(name = "quest_income", nullable = false)
    private Long questIncome;

    @Column(name = "income_ratio")
    private Integer incomeRatio;

    @Column(name = "expense_ratio")
    private Integer expenseRatio;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}