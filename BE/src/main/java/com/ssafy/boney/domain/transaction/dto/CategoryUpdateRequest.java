package com.ssafy.boney.domain.transaction.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryUpdateRequest {
    // 수정할 카테고리의 ID (예: 1=입금, 2=출금, 5=용돈, etc.)
    private Integer transactionCategoryId;
}
