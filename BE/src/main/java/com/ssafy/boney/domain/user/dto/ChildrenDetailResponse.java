package com.ssafy.boney.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChildrenDetailResponse {
    private Integer childId;
    private String childName;
    private String childGender;
    private String childAccountNum; // 자녀 계좌 번호
    private Integer bankNum;        // 해당 계좌의 은행 번호
    private Integer creditScore;
    private Long loanAmount;
    private RegularTransferResponse regularTransfer;
}
