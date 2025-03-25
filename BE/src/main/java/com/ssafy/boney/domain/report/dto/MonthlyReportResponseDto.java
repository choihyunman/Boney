package com.ssafy.boney.domain.report.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReportResponseDto {
    private String reportMonth;
    private Long totalIncome;
    private Long totalExpense;
    private Integer incomeRatio;
    private Integer expenseRatio;
    private List<CategoryExpenseDto> categoryExpense;
    private CompletedQuestsDto completedQuests;
    private List<ThreeMonthsTrendDto> threeMonthsTrend;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryExpenseDto {
        private String category;
        private Long amount;
        private Integer percentage;
        private List<TransactionDetailDto> transactions;
    }
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionDetailDto {
        private Integer transactionId;
        private Long amount;
        private String createdAt;
        private String transactionType;
        private String transactionContent;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompletedQuestsDto {
        private Integer count;
        private Long totalIncome;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThreeMonthsTrendDto {
        private String month;
        private Long income;
        private Long expense;
    }
}
