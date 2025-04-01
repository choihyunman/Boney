package com.ssafy.boney.domain.report.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponse;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponse.CategoryExpenseDto;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponse.CompletedQuestsDto;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponse.ThreeMonthsTrendDto;
import com.ssafy.boney.domain.report.entity.MonthlyReport;
import com.ssafy.boney.domain.report.exception.MonthlyReportNotFoundException;
import com.ssafy.boney.domain.report.repository.MonthlyReportRepository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MonthlyReportService {

    private final MonthlyReportRepository monthlyReportRepository;
    private final ObjectMapper objectMapper;
    private final TransactionRepository transactionRepository;

    @Autowired
    public MonthlyReportService(MonthlyReportRepository monthlyReportRepository,
                                ObjectMapper objectMapper,
                                TransactionRepository transactionRepository) {
        this.monthlyReportRepository = monthlyReportRepository;
        this.objectMapper = objectMapper;
        this.transactionRepository = transactionRepository;
    }

    /**
     * 요청된 연/월에 대해 월간 레포트를 조회합니다.
     *
     * - 현재 달(예: 3월)의 경우: 3월 1일부터 현재 시점까지의 거래 내역을 이용해
     *   기존 레포트가 있으면 삭제한 후 새로 생성하여 반환합니다.
     * - 그 외 달(12월, 1월, 2월 등)의 경우: 기존에 생성된 레포트를 그대로 조회합니다.
     */
    public MonthlyReportResponse getMonthlyReport(User user, int year, int month) {
        LocalDate requestedMonth = LocalDate.of(year, month, 1);
        LocalDate currentMonthFirstDay = LocalDate.now().withDayOfMonth(1);

        // 현재 달인 경우: 동적으로 1일부터 현재까지의 거래 내역 기반 레포트를 생성 (기존 레포트는 삭제)
        if (requestedMonth.equals(currentMonthFirstDay)) {
            monthlyReportRepository.findByChild_UserIdAndReportMonth(user.getUserId(), requestedMonth)
                    .ifPresent(monthlyReportRepository::delete);

            LocalDateTime startDateTime = requestedMonth.atStartOfDay();
            LocalDateTime endDateTime = LocalDateTime.now();

            // 현재 달의 거래 내역 조회 (1일 ~ 현재 시점)
            List<Transaction> transactions = transactionRepository.findByUserAndCreatedAtBetween(user, startDateTime, endDateTime);

            // 총 수입: DEPOSIT 거래 합계
            long totalIncome = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.DEPOSIT)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            // 총 지출: WITHDRAWAL 거래 합계
            long totalExpense = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.WITHDRAWAL)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            // 카테고리별 지출 집계
            Map<String, Long> categoryExpenseMap = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.WITHDRAWAL)
                    .collect(Collectors.groupingBy(
                            t -> t.getTransactionCategory().getTransactionCategoryName(),
                            Collectors.summingLong(Transaction::getTransactionAmount)
                    ));

            List<CategoryExpenseDto> categoryExpenseList = new ArrayList<>();
            for (Map.Entry<String, Long> entry : categoryExpenseMap.entrySet()) {
                int percentage = totalExpense > 0 ? (int) (entry.getValue() * 100 / totalExpense) : 0;
                List<Transaction> transactionsForCategory = transactions.stream()
                        .filter(t -> t.getTransactionType() == TransactionType.WITHDRAWAL &&
                                t.getTransactionCategory().getTransactionCategoryName().equals(entry.getKey()))
                        .collect(Collectors.toList());
                List<MonthlyReportResponse.TransactionDetailDto> transactionDetailList = transactionsForCategory.stream()
                        .map(t -> MonthlyReportResponse.TransactionDetailDto.builder()
                                .transactionId(t.getTransactionId())
                                .amount(t.getTransactionAmount())
                                .createdAt(t.getCreatedAt().toString())
                                .transactionType(t.getTransactionType().name())
                                .transactionContent(t.getTransactionContent() != null
                                        ? t.getTransactionContent().getContentName()
                                        : null)
                                .build())
                        .collect(Collectors.toList());

                categoryExpenseList.add(CategoryExpenseDto.builder()
                        .category(entry.getKey())
                        .amount(entry.getValue())
                        .percentage(percentage)
                        .transactions(transactionDetailList)
                        .build());
            }

            // 퀘스트 관련 계산: 거래 카테고리가 "퀘스트"인 거래 (DEPOSIT 기준)
            List<Transaction> questTransactions = transactions.stream()
                    .filter(t -> "퀘스트".equals(t.getTransactionCategory().getTransactionCategoryName()))
                    .collect(Collectors.toList());
            int questCompleted = (int) questTransactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.DEPOSIT)
                    .count();
            long questIncome = questTransactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.DEPOSIT)
                    .mapToLong(Transaction::getTransactionAmount)
                    .sum();

            int incomeRatio = (totalIncome + totalExpense) > 0 ? (int) (totalIncome * 100 / (totalIncome + totalExpense)) : 0;
            int expenseRatio = (totalIncome + totalExpense) > 0 ? (int) (totalExpense * 100 / (totalIncome + totalExpense)) : 0;

            String categoryExpenseJson;
            try {
                categoryExpenseJson = objectMapper.writeValueAsString(categoryExpenseList);
            } catch (Exception e) {
                throw new RuntimeException("카테고리별 지출 내역 JSON 파싱 에러", e);
            }

            // 현재 달의 레포트 생성 및 저장 (reportMonth는 해당 달의 1일)
            MonthlyReport report = MonthlyReport.builder()
                    .child(user)
                    .reportMonth(requestedMonth)
                    .totalIncome(totalIncome)
                    .totalExpense(totalExpense)
                    .incomeRatio(incomeRatio)
                    .expenseRatio(expenseRatio)
                    .categoryExpense(categoryExpenseJson)
                    .questCompleted(questCompleted)
                    .questIncome(questIncome)
                    .build();

            monthlyReportRepository.save(report);

            // 3개월 추이 데이터: 요청 달과 이전 2개월
            LocalDate trendStartMonth = requestedMonth.minusMonths(2);
            List<MonthlyReport> trendReports = monthlyReportRepository.findByChildAndReportMonthBetweenOrderByReportMonthAsc(
                    user, trendStartMonth, requestedMonth);

            List<ThreeMonthsTrendDto> threeMonthsTrend = trendReports.stream()
                    .map(r -> ThreeMonthsTrendDto.builder()
                            .month(r.getReportMonth().toString().substring(0, 7))
                            .income(r.getTotalIncome())
                            .expense(r.getTotalExpense())
                            .build())
                    .collect(Collectors.toList());

            CompletedQuestsDto completedQuests = CompletedQuestsDto.builder()
                    .count(report.getQuestCompleted())
                    .totalIncome(report.getQuestIncome())
                    .build();

            return MonthlyReportResponse.builder()
                    .reportMonth(report.getReportMonth().toString().substring(0, 7))
                    .totalIncome(report.getTotalIncome())
                    .totalExpense(report.getTotalExpense())
                    .incomeRatio(report.getIncomeRatio())
                    .expenseRatio(report.getExpenseRatio())
                    .categoryExpense(categoryExpenseList)
                    .completedQuests(completedQuests)
                    .threeMonthsTrend(threeMonthsTrend)
                    .build();
        } else {
            // 현재 달이 아닌 경우: 기존에 생성된 레포트를 그대로 조회
            MonthlyReport report = monthlyReportRepository.findByChild_UserIdAndReportMonth(user.getUserId(), requestedMonth)
                    .orElseThrow(() -> new MonthlyReportNotFoundException("월간 레포트가 존재하지 않습니다. (월: " + requestedMonth + ")"));

            List<CategoryExpenseDto> categoryExpenseList;
            try {
                categoryExpenseList = objectMapper.readValue(report.getCategoryExpense(), new TypeReference<List<CategoryExpenseDto>>() {});
            } catch (Exception e) {
                throw new RuntimeException("카테고리별 지출 내역 JSON 파싱 에러", e);
            }

            LocalDate trendStartMonth = requestedMonth.minusMonths(2);
            List<MonthlyReport> trendReports = monthlyReportRepository.findByChildAndReportMonthBetweenOrderByReportMonthAsc(
                    user, trendStartMonth, requestedMonth);

            List<ThreeMonthsTrendDto> threeMonthsTrend = trendReports.stream()
                    .map(r -> ThreeMonthsTrendDto.builder()
                            .month(r.getReportMonth().toString().substring(0, 7))
                            .income(r.getTotalIncome())
                            .expense(r.getTotalExpense())
                            .build())
                    .collect(Collectors.toList());

            CompletedQuestsDto completedQuests = CompletedQuestsDto.builder()
                    .count(report.getQuestCompleted())
                    .totalIncome(report.getQuestIncome())
                    .build();

            return MonthlyReportResponse.builder()
                    .reportMonth(report.getReportMonth().toString().substring(0, 7))
                    .totalIncome(report.getTotalIncome())
                    .totalExpense(report.getTotalExpense())
                    .incomeRatio(report.getIncomeRatio())
                    .expenseRatio(report.getExpenseRatio())
                    .categoryExpense(categoryExpenseList)
                    .completedQuests(completedQuests)
                    .threeMonthsTrend(threeMonthsTrend)
                    .build();
        }
    }
}
