package com.ssafy.boney.domain.report.controller;

import com.ssafy.boney.domain.report.dto.ApiResponse;
import com.ssafy.boney.domain.report.dto.MonthlyReportResponseDto;
import com.ssafy.boney.domain.report.exception.MonthlyReportNotFoundException;
import com.ssafy.boney.domain.report.service.MonthlyReportService;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class MonthlyReportController {

    private final MonthlyReportService monthlyReportService;
    private final UserRepository userRepository;

    @Autowired
    public MonthlyReportController(MonthlyReportService monthlyReportService, UserRepository userRepository) {
        this.monthlyReportService = monthlyReportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<MonthlyReportResponseDto>> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month,
            HttpServletRequest request
    ) {
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("사용자 인증 정보가 없습니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        MonthlyReportResponseDto report = monthlyReportService.getMonthlyReport(user, year, month);
        ApiResponse<MonthlyReportResponseDto> response = ApiResponse.<MonthlyReportResponseDto>builder()
                .status("200")
                .message("월간 레포트 조회 성공")
                .data(report)
                .build();
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(MonthlyReportNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException(MonthlyReportNotFoundException ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .status("404")
                .message(ex.getMessage())
                .data(null)
                .build();
        return ResponseEntity.status(404).body(response);
    }
}
