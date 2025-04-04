package com.ssafy.boney.domain.scheduledTransfer.controller;

import com.ssafy.boney.domain.scheduledTransfer.exception.ResourceAlreadyExistsException;
import com.ssafy.boney.domain.user.dto.ChildrenDetailResponse;
import com.ssafy.boney.domain.user.dto.RegularTransferResponse;
import com.ssafy.boney.domain.user.service.ParentChildService;
import com.ssafy.boney.global.dto.ApiResponse;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/allowance/schedule")
@RequiredArgsConstructor
public class AllowanceScheduleController {

    private final ParentChildService parentChildService;

    // 정기 송금 내역 생성 엔드포인트 (POST)
    @PostMapping("/{childId}")
    public ResponseEntity<ApiResponse<ChildrenDetailResponse>> createRegularTransfer(@PathVariable Integer childId,
                                                                                     @RequestBody RegularTransferResponse request,
                                                                                     HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        try {
            ChildrenDetailResponse response = parentChildService.createChildRegularTransfer(parentId, childId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "정기 용돈 송금 내역이 생성되었습니다.", response));
        } catch (ResourceAlreadyExistsException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(404, ex.getMessage(), null));
        }
    }

    // 정기 송금 내역 수정 엔드포인트 (PUT)
    @PutMapping("/{childId}")
    public ResponseEntity<ApiResponse<ChildrenDetailResponse>> updateRegularTransfer(@PathVariable Integer childId,
                                                                                     @RequestBody RegularTransferResponse request,
                                                                                     HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        try {
            ChildrenDetailResponse updatedResponse = parentChildService.updateChildRegularTransfer(parentId, childId, request);
            return ResponseEntity.ok(new ApiResponse<>(200, "정기 용돈 송금 내역이 수정되었습니다.", updatedResponse));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 부모의 정기 용돈 송금 내역이 없습니다.", null));
        }
    }

    @DeleteMapping("/{childId}")
    public ResponseEntity<ApiResponse<Void>> cancelRegularTransfer(@PathVariable Integer childId,
                                                                   HttpServletRequest httpRequest) {
        Integer parentId = (Integer) httpRequest.getAttribute("userId");
        try {
            parentChildService.cancelChildRegularTransfer(parentId, childId);
            return ResponseEntity.ok(new ApiResponse<>(200, "정기 용돈 송금 내역이 해지(삭제)되었습니다.", null));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, ex.getMessage(), null));
        }
    }
}
