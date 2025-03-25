package com.ssafy.boney.domain.report.exception;

public class MonthlyReportNotFoundException extends RuntimeException {
    public MonthlyReportNotFoundException(String message) {
        super(message);
    }
}
