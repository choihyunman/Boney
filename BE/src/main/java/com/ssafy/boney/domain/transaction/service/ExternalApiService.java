package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.global.config.ExternalApiProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Random;

@Service
public class ExternalApiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ExternalApiProperties externalApiProperties;

    public ExternalApiService(ExternalApiProperties externalApiProperties) {
        this.externalApiProperties = externalApiProperties;
    }

    public Map<String, Object> getExternalTransactionHistory(String accountNo, String startDate, String endDate) {
        // yml에서 주입받은 transaction URL 사용
        String url = externalApiProperties.getTransaction().getUrl();

        String random6 = String.format("%06d", new Random().nextInt(1_000_000));
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String institutionTransactionUniqueNo = transmissionDate + transmissionTime + random6;

        Map<String, Object> requestBody = Map.of(
                "Header", Map.of(
                        "apiName", "inquireTransactionHistoryList",
                        "transmissionDate", transmissionDate,
                        "transmissionTime", transmissionTime,
                        "institutionCode", externalApiProperties.getAccountAuth().getInstitutionCode(),
                        "fintechAppNo", externalApiProperties.getAccountAuth().getFintechAppNo(),
                        "apiServiceCode", externalApiProperties.getAccountAuth().getApiServiceCode(),
                        "institutionTransactionUniqueNo", institutionTransactionUniqueNo,
                        "apiKey", externalApiProperties.getAccountAuth().getApiKey(),
                        "userKey", externalApiProperties.getAccountAuth().getUserKey()
                ),
                "accountNo", accountNo,
                "startDate", startDate,
                "endDate", endDate,
                "transactionType", "A",
                "orderByType","ASC"
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

        return response.getBody();
    }
}