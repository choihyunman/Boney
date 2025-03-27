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
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MonthlyReportService {

    private final MonthlyReportRepository monthlyReportRepository;
    private final ObjectMapper objectMapper; // JSON 변환용

    @Autowired
    public MonthlyReportService(MonthlyReportRepository monthlyReportRepository, ObjectMapper objectMapper) {
        this.monthlyReportRepository = monthlyReportRepository;
        this.objectMapper = objectMapper;
    }

    public MonthlyReportResponse getMonthlyReport(User user, int year, int month) {
        LocalDate reportMonth = LocalDate.of(year, month, 1);

        // 요청한 월의 레포트 조회
        MonthlyReport report = monthlyReportRepository.findByChild_UserIdAndReportMonth(user.getUserId(), reportMonth)
                .orElseThrow(() -> new MonthlyReportNotFoundException("월간 레포트가 존재하지 않습니다. (월: " + reportMonth + ")"));

        // categoryExpense 컬럼(JSON)을 변경된 DTO 구조(List<CategoryExpenseDto>)로 변환
        List<CategoryExpenseDto> categoryExpenseList;
        try {
            categoryExpenseList = objectMapper.readValue(report.getCategoryExpense(),
                    new TypeReference<List<CategoryExpenseDto>>() {});
        } catch (Exception e) {
            throw new RuntimeException("카테고리별 지출 내역 JSON 파싱 에러", e);
        }

        // quest 관련 정보 구성
        CompletedQuestsDto completedQuests = CompletedQuestsDto.builder()
                .count(report.getQuestCompleted())
                .totalIncome(report.getQuestIncome())
                .build();

        // 3개월 추이: 현재 월과 이전 2개월을 조회
        LocalDate startMonth = reportMonth.minusMonths(2);
        LocalDate endMonth = reportMonth;
        List<MonthlyReport> trendReports = monthlyReportRepository.findByChildAndReportMonthBetweenOrderByReportMonthAsc(user, startMonth, endMonth);

        List<ThreeMonthsTrendDto> threeMonthsTrend = trendReports.stream().map(r ->
                ThreeMonthsTrendDto.builder()
                        .month(r.getReportMonth().toString().substring(0, 7)) // "YYYY-MM" 포맷
                        .income(r.getTotalIncome())
                        .expense(r.getTotalExpense())
                        .build()
        ).collect(Collectors.toList());

        // 응답 DTO 구성
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
