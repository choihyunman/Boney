package com.ssafy.boney.domain.report.repository;

import com.ssafy.boney.domain.report.entity.MonthlyReport;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Integer> {
    Optional<MonthlyReport> findByChild_UserIdAndReportMonth(Integer userId, LocalDate reportMonth);
    List<MonthlyReport> findByChildAndReportMonthBetweenOrderByReportMonthAsc(User child, LocalDate start, LocalDate end);

    void deleteAllByChild(User child);


}
