package com.ssafy.boney.domain.transaction.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class HashtagUpdateRequest {
    // 수정하려는 해시태그 목록 (최대 3개, #문자 제거는 Service 로직에서 처리)
    private List<String> hashtags;
}
