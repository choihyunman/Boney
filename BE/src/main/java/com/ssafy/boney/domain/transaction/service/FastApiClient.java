package com.ssafy.boney.domain.transaction.service;

import org.springframework.beans.factory.annotation.Value;
import com.ssafy.boney.domain.transaction.dto.AnomalyRequestDto;
import com.ssafy.boney.domain.transaction.dto.AnomalyResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FastApiClient {

    private final RestTemplate restTemplate;
    @Value("${fastapi.url}")
    private String fastApiUrl;

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AnomalyResponseDto detectAnomaly(AnomalyRequestDto request) {
        return restTemplate.postForObject(fastApiUrl, request, AnomalyResponseDto.class);
    }
}
