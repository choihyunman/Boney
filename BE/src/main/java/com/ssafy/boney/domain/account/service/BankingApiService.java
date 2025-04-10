package com.ssafy.boney.domain.account.service;

import com.ssafy.boney.domain.transaction.dto.TransactionHistoryResponseDto;
import com.ssafy.boney.domain.transaction.dto.TransferApiResponseDto;

public interface BankingApiService {

    // 계좌 이체
    TransferApiResponseDto transfer(String fromAccount, String toAccount, Long amount, String depositSummary, String withdrawalSummary);

    // 예금주 이름 조회
    String getAccountHolderName(String accountNumber);

    // SSAFY API 계좌 잔액 조회
    Long getAccountBalance(String accountNumber);

    // 거래 내역 조회 API 호출
    TransactionHistoryResponseDto inquireTransactionHistory(String accountNo, String transactionUniqueNo);
}