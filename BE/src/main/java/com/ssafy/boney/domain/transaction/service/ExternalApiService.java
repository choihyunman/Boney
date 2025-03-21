package com.ssafy.boney.domain.transaction.service;

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

@Service
public class ExternalApiService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getExternalTransactionHistory(String accountNo, String startDate, String endDate) {

        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList";

        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String institutionTransactionUniqueNo = transmissionDate + transmissionTime + "123456";

        Map<String, Object> requestBody = Map.of(
                "Header", Map.of(
                        "apiName", "inquireTransactionHistoryList",
                        "transmissionDate", transmissionDate,
                        "transmissionTime", transmissionTime,
                        "institutionCode", "00100",
                        "fintechAppNo", "001",
                        "apiServiceCode", "inquireTransactionHistoryList",
                        "institutionTransactionUniqueNo", institutionTransactionUniqueNo,
                        "apiKey", "953bd1ca18c748a4b88b2b6449c30000",
                        "userKey", "eb29c6fe-771e-4237-a3d7-c203cfd7830c"
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