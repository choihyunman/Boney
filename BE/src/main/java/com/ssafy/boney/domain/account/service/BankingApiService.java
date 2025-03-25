package com.ssafy.boney.domain.account.service;

public interface BankingApiService {

    // 계좌 이체
    void transfer(String fromAccount, String toAccount, Long amount, String summary);

    // 예금주 이름 조회
    String getAccountHolderName(String accountNumber);

    // SSAFY API 계좌 잔액 조회
    Long getAccountBalance(String accountNumber);
}