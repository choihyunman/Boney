package com.ssafy.boney.domain.report.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.boney.domain.report.entity.MonthlyReport;
import com.ssafy.boney.domain.report.repository.MonthlyReportRepository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.entity.enums.Role;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponse;
import com.ssafy.boney.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class MonthlyReportScheduler {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public MonthlyReportScheduler(UserRepository userRepository,
                                  TransactionRepository transactionRepository,
                                  MonthlyReportRepository monthlyReportRepository,
                                  ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.monthlyReportRepository = monthlyReportRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 매월 1일 0시에 실행되는 스케줄러
     * 이전 달의 거래 내역을 집계하여 월간 레포트 생성
     * 0 * * * * ? // 매 분
     * 0 0 0 1 * ? // 매월 1일 12시
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void aggregateMonthlyReports() {
        // 이전 달 산출 (예: 2023년 7월 1일에 실행 → 2023년 6월)
        YearMonth previousMonth = YearMonth.now().minusMonths(1);
        LocalDate startDate = previousMonth.atDay(1);
        LocalDate endDate = previousMonth.atEndOfMonth();
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 역할이 CHILD인 사용자(아이) 목록 조회
        List<User> childUsers = userRepository.findAllByRole(Role.CHILD);

        for (User child : childUsers) {
            // 기존에 해당 기간에 생성된 레포트가 있는지 확인 (중복 집계 방지)
            if (monthlyReportRepository.findByChild_UserIdAndReportMonth(child.getUserId(), startDate).isPresent()) {
                continue;
            }

            // 해당 사용자에 대해 이전 달 거래 내역 조회
            List<Transaction> transactions = transactionRepository.findByUserAndCreatedAtBetween(child, startDateTime, endDateTime);

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

            // 카테고리별 지출: WITHDRAWAL 거래를 카테고리별로 그룹화
            Map<String, Long> categoryExpenseMap = transactions.stream()
                    .filter(t -> t.getTransactionType() == TransactionType.WITHDRAWAL)
                    .collect(Collectors.groupingBy(
                            t -> t.getTransactionCategory().getTransactionCategoryName(), // 거래 카테고리명 사용
                            Collectors.summingLong(Transaction::getTransactionAmount)
                    ));

            // 카테고리별 지출 DTO 목록 구성 (거래 내역 포함)
            List<MonthlyReportResponse.CategoryExpenseDto> categoryExpenseList = new ArrayList<>();
            for (Map.Entry<String, Long> entry : categoryExpenseMap.entrySet()) {
                int percentage = totalExpense > 0 ? (int) (entry.getValue() * 100 / totalExpense) : 0;
                // 해당 카테고리에 속하는 거래 내역 조회
                List<Transaction> transactionsForCategory = transactions.stream()
                        .filter(t -> t.getTransactionType() == TransactionType.WITHDRAWAL &&
                                t.getTransactionCategory().getTransactionCategoryName().equals(entry.getKey()))
                        .collect(Collectors.toList());
                // 거래 내역 DTO 변환
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


                categoryExpenseList.add(MonthlyReportResponse.CategoryExpenseDto.builder()
                        .category(entry.getKey())
                        .amount(entry.getValue())
                        .percentage(percentage)
                        .transactions(transactionDetailList)
                        .build());
            }

            // 퀘스트 관련 정보: 거래 카테고리가 "퀘스트"인 거래 (DEPOSIT 기준)
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

            // 수입/지출 비율 계산
            int incomeRatio = (totalIncome + totalExpense) > 0 ? (int) (totalIncome * 100 / (totalIncome + totalExpense)) : 0;
            int expenseRatio = (totalIncome + totalExpense) > 0 ? (int) (totalExpense * 100 / (totalIncome + totalExpense)) : 0;

            // 카테고리별 지출 내역을 JSON 문자열로 변환
            String categoryExpenseJson;
            try {
                categoryExpenseJson = objectMapper.writeValueAsString(categoryExpenseList);
            } catch (Exception e) {
                // 변환 실패 시 해당 사용자는 스킵 (로그를 남기는 것이 좋습니다)
                continue;
            }

            // 새로운 월간 레포트 생성 및 저장
            MonthlyReport report = MonthlyReport.builder()
                    .child(child)
                    .reportMonth(startDate) // 이전 달의 첫날
                    .totalIncome(totalIncome)
                    .totalExpense(totalExpense)
                    .incomeRatio(incomeRatio)
                    .expenseRatio(expenseRatio)
                    .categoryExpense(categoryExpenseJson)
                    .questCompleted(questCompleted)
                    .questIncome(questIncome)
                    .build();

            monthlyReportRepository.save(report);
        }
    }
}
