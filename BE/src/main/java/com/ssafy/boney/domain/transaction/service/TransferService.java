package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.*;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.Transfer;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.transaction.repository.TransferRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransferRepository transferRepository;
    private final BankingApiService bankingApiService;
    private final PasswordEncoder passwordEncoder;

    // 1. 예금주 조회
    public HolderCheckResponseDto getAccountHolder(String accountNo) {
        String accountHolderName;
        try {
            accountHolderName = bankingApiService.getAccountHolderName(accountNo);
        } catch (RuntimeException e) {
            throw new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND);
        }
        HolderCheckResponseDto dto = new HolderCheckResponseDto();
        dto.setAccountHolderName(accountHolderName);
        return dto;
    }


}
