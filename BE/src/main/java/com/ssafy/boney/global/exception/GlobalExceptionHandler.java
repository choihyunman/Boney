package com.ssafy.boney.global.exception;

import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestException;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.user.exception.UserConflictException;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.global.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * 컨트롤러 전역 예외 처리
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(MethodArgumentTypeMismatchException ex) {
        ApiResponse<Object> response = new ApiResponse<>(400, "요청 데이터가 유효하지 않습니다.", null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Object> response = new ApiResponse<>(404, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomException(CustomException ex) {
        int status = ex.getErrorCode().getStatus().value();
        ApiResponse<Object> response = new ApiResponse<>(status, ex.getErrorCode().getMessage(), null);
        return ResponseEntity.status(ex.getErrorCode().getStatus()).body(response);
    }

    @ExceptionHandler(UserConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserConflictException(UserConflictException ex) {
        int status = ex.getErrorCode().getStatus();
        ApiResponse<Object> response = new ApiResponse<>(status, ex.getErrorCode().getMessage(), null);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserNotFoundException(UserNotFoundException ex) {
        int status = ex.getErrorCode().getStatus();
        ApiResponse<Object> response = new ApiResponse<>(status, ex.getErrorCode().getMessage(), null);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(QuestException.class)
    public ResponseEntity<ApiResponse<Object>> handleQuestException(QuestException ex) {
        QuestErrorCode errorCode = ex.getErrorCode();
        ApiResponse<Object> response = new ApiResponse<>(errorCode.getStatus(), errorCode.getMessage(), null);
        return ResponseEntity.status(errorCode.getStatus()).body(response);
    }

    // 그 외 처리되지 않은 예외에 대한 catch-all 핸들러
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAllExceptions(Exception ex) {
        ApiResponse<Object> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}