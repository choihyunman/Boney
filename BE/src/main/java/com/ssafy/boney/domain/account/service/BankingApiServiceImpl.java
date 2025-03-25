package com.ssafy.boney.domain.account.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BankingApiServiceImpl implements BankingApiService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${bank.api.base-url}")
    private String baseUrl;

    @Value("${bank.api.api-key}")
    private String apiKey;

    @Value("${bank.api.user-key}")
    private String userKey;

    // 계좌 송금
    @Override
    public void transfer(String fromAccount, String toAccount, Long amount, String summary) {
        String url = baseUrl + "/edu/demandDeposit/updateDemandDepositAccountTransfer";

        Map<String, Object> body = new HashMap<>();
        body.put("depositAccountNo", toAccount);
        body.put("depositTransactionSummary", summary);
        body.put("transactionBalance", amount);
        body.put("withdrawalAccountNo", fromAccount);
        body.put("withdrawalTransactionSummary", summary);
        body.put("Header", generateHeader("updateDemandDepositAccountTransfer"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // RestTemplate의 기본 에러 핸들러가 상태 코드 4xx, 5xx일 경우 예외를 던집니다.
        restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
    }

    // 예금주 확인
    @Override
    public String getAccountHolderName(String accountNumber) {
        String url = baseUrl + "/edu/demandDeposit/inquireDemandDepositAccountHolderName";

        Map<String, Object> body = new HashMap<>();
        body.put("accountNo", accountNumber);
        body.put("Header", generateHeader("inquireDemandDepositAccountHolderName"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
        Map<String, Object> responseBody = response.getBody();

        // REC가 Map이면 바로 반환, List이면 첫번째 요소의 userName 반환
        Object recObj = responseBody.get("REC");
        if (recObj instanceof Map) {
            return (String) ((Map<String, Object>) recObj).get("userName");
        } else if (recObj instanceof List) {
            return (String) ((List<Map<String, Object>>) recObj).get(0).get("userName");
        } else {
            throw new RuntimeException("REC 필드 형식이 올바르지 않습니다.");
        }
    }

    // SSAFY API 잔액 조회
    @Override
    public Long getAccountBalance(String accountNumber) {
        String url = baseUrl + "/edu/demandDeposit/inquireDemandDepositAccountBalance";

        Map<String, Object> body = new HashMap<>();
        body.put("accountNo", accountNumber);
        body.put("Header", generateHeader("inquireDemandDepositAccountBalance"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
        Map<String, Object> responseBody = response.getBody();

        Object recObj = responseBody.get("REC");
        Map<String, Object> recItem;
        if (recObj instanceof Map) {
            recItem = (Map<String, Object>) recObj;
        } else if (recObj instanceof List) {
            recItem = ((List<Map<String, Object>>) recObj).get(0);
        } else {
            throw new RuntimeException("REC 필드 형식이 올바르지 않습니다.");
        }

        Object balanceObj = recItem.get("accountBalance");
        try {
            return Long.parseLong(balanceObj.toString());
        } catch (NumberFormatException e) {
            throw new RuntimeException("accountBalance 값 파싱 실패", e);
        }
    }

    // 헤더 생성
    private Map<String, Object> generateHeader(String apiName) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter date = DateTimeFormatter.ofPattern("yyyyMMdd");
        DateTimeFormatter time = DateTimeFormatter.ofPattern("HHmmss");

        Map<String, Object> header = new HashMap<>();
        header.put("apiName", apiName);
        header.put("transmissionDate", now.format(date));
        header.put("transmissionTime", now.format(time));
        header.put("institutionCode", "00100");
        header.put("fintechAppNo", "001");
        header.put("apiServiceCode", apiName);
        header.put("institutionTransactionUniqueNo", now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "123456");
        header.put("apiKey", apiKey);
        header.put("userKey", userKey);
        return header;
    }


}
