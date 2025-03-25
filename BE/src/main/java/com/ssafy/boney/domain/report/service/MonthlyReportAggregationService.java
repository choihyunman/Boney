package com.ssafy.boney.domain.report.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.boney.domain.report.entity.MonthlyReport;
import com.ssafy.boney.domain.report.repository.MonthlyReportRepository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.domain.user.entity.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MonthlyReportAggregationService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public MonthlyReportAggregationService(TransactionRepository transactionRepository,
                                           UserRepository userRepository,
                                           MonthlyReportRepository monthlyReportRepository,
                                           ObjectMapper objectMapper) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.monthlyReportRepository = monthlyReportRepository;
        this.objectMapper = objectMapper;
    }

    public void aggregateMonthlyReportsForLastMonth() {
        // 지난 달 계산 (예: 오늘이 2023-08-01이면, 대상은 2023-07)
        LocalDate now = LocalDate.now();
        LocalDate lastMonth = now.minusMonths(1).withDayOfMonth(1);
        LocalDateTime startDateTime = lastMonth.atStartOfDay();
        LocalDateTime endDateTime = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()).atTime(LocalTime.MAX);

        // 모든 CHILD 역할 사용자를 조회 (User 엔티티의 role은 Role enum으로 가정)
        List<User> childUsers = userRepository.findAllByRole(Role.CHILD);

        for (User child : childUsers) {
            // 해당 사용자의 지난 달 거래 내역 조회
            List<Transaction> transactions = transactionRepository.findByUserAndCreatedAtBetween(child, startDateTime, endDateTime);

            // 총 수입: DEPOSIT 거래 합계
            long totalIncome = transactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.DEPOSIT)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            // 총 지출: WITHDRAWAL 거래 합계
            long totalExpense = transactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.WITHDRAWAL)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            // 카테고리별 지출 내역 (WITHDRAWAL 거래를 기준으로 그룹화)
            Map<String, Long> categoryExpenseMap = transactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.WITHDRAWAL)
                    .collect(Collectors.groupingBy(tx -> tx.getTransactionCategory().getTransactionCategoryName(),
                            Collectors.summingLong(Transaction::getTransactionAmount)));

            List<Map<String, Object>> categoryExpenseList = new ArrayList<>();
            for (Map.Entry<String, Long> entry : categoryExpenseMap.entrySet()) {
                int percentage = totalExpense > 0 ? (int) ((entry.getValue() * 100) / totalExpense) : 0;
                Map<String, Object> map = new HashMap<>();
                map.put("category", entry.getKey());
                map.put("amount", entry.getValue());
                map.put("percentage", percentage);
                categoryExpenseList.add(map);
            }

            // 퀘스트 관련 정보: 카테고리명이 "퀘스트"인 거래 내역
            List<Transaction> questTransactions = transactions.stream()
                    .filter(tx -> "퀘스트".equals(tx.getTransactionCategory().getTransactionCategoryName()))
                    .collect(Collectors.toList());
            int questCompleted = questTransactions.size();
            long questIncome = questTransactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.DEPOSIT)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            // 수입/지출 비율 계산 (전체 금액이 0이 아닐 때)
            int incomeRatio = (totalIncome + totalExpense) > 0 ? (int) ((totalIncome * 100) / (totalIncome + totalExpense)) : 0;
            int expenseRatio = 100 - incomeRatio;

            // 카테고리별 지출 내역 리스트를 JSON 문자열로 변환
            String categoryExpenseJson;
            try {
                categoryExpenseJson = objectMapper.writeValueAsString(categoryExpenseList);
            } catch (Exception e) {
                throw new RuntimeException("카테고리별 지출 내역 JSON 변환 에러", e);
            }

            // MonthlyReport 엔티티 생성 (reportMonth는 지난 달의 1일로 저장)
            MonthlyReport monthlyReport = MonthlyReport.builder()
                    .child(child)
                    .reportMonth(lastMonth)
                    .totalIncome(totalIncome)
                    .totalExpense(totalExpense)
                    .categoryExpense(categoryExpenseJson)
                    .questCompleted(questCompleted)
                    .questIncome(questIncome)
                    .incomeRatio(incomeRatio)
                    .expenseRatio(expenseRatio)
                    .build();

            monthlyReportRepository.save(monthlyReport);
        }
    }
}
