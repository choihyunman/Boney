package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.transaction.dto.AnomalyRequestDto;
import com.ssafy.boney.domain.transaction.dto.AnomalyResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FastApiClient {

    private final RestTemplate restTemplate;
    // FastAPI URL (설정 파일에서 주입 가능)
    private final String fastApiUrl = "http://0.0.0.0:8000/anomaly/detect";

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AnomalyResponseDto detectAnomaly(AnomalyRequestDto request) {
        return restTemplate.postForObject(fastApiUrl, request, AnomalyResponseDto.class);
    }
}
