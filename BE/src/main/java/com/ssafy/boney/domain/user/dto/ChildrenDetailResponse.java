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
    private Integer creditScore;
    private Long loanAmount;
    private RegularTransferResponse regularTransfer;
}
