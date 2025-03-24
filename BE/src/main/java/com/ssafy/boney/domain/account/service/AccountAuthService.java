package com.ssafy.boney.domain.account.service;

import com.ssafy.boney.global.config.ExternalApiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AccountAuthService {

    private final WebClient webClient = WebClient.create();
    private final ExternalApiProperties externalApiProperties;

    public Map<String, Object> sendAuthRequest(String accountNo) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HHmmss");

        String transmissionDate = now.format(dateFormatter);
        String transmissionTime = now.format(timeFormatter);
        String random6 = String.format("%06d", new Random().nextInt(1_000_000));
        String institutionTransactionUniqueNo = transmissionDate + transmissionTime + random6;

        Map<String, Object> header = Map.of(
                "apiName", externalApiProperties.getApiServiceCode(),
                "transmissionDate", transmissionDate,
                "transmissionTime", transmissionTime,
                "institutionCode", externalApiProperties.getInstitutionCode(),
                "fintechAppNo", externalApiProperties.getFintechAppNo(),
                "apiServiceCode", externalApiProperties.getApiServiceCode(),
                "institutionTransactionUniqueNo", institutionTransactionUniqueNo,
                "apiKey", externalApiProperties.getApiKey(),
                "userKey", externalApiProperties.getUserKey()
        );

        Map<String, Object> body = Map.of(
                "Header", header,
                "accountNo", accountNo,
                "authText", "SSAFY"
        );

        return webClient.post()
                .uri(externalApiProperties.getUrlOneCoin())
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    public Map<String, Object> verifyAuthCode(String accountNo, String authCode) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HHmmss");

        String transmissionDate = now.format(dateFormatter);
        String transmissionTime = now.format(timeFormatter);
        String random6 = String.format("%06d", new Random().nextInt(1_000_000));
        String institutionTransactionUniqueNo = transmissionDate + transmissionTime + random6;

        Map<String, Object> header = Map.of(
                "apiName", "checkAuthCode",
                "transmissionDate", transmissionDate,
                "transmissionTime", transmissionTime,
                "institutionCode", externalApiProperties.getInstitutionCode(),
                "fintechAppNo", externalApiProperties.getFintechAppNo(),
                "apiServiceCode", "checkAuthCode",
                "institutionTransactionUniqueNo", institutionTransactionUniqueNo,
                "apiKey", externalApiProperties.getApiKey(),
                "userKey", externalApiProperties.getUserKey()
        );

        Map<String, Object> body = Map.of(
                "Header", header,
                "accountNo", accountNo,
                "authText", "SSAFY",
                "authCode", authCode
        );

        return webClient.post()
                .uri("https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/checkAuthCode")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    
}
