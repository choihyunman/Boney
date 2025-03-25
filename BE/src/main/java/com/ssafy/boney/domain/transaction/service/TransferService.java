package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.*;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
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
    private final BankingApiService bankingApiService;
    private final PasswordEncoder passwordEncoder;

    // 예금주 조회
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

    // 송금
    @Transactional
    public TransferResponseDto processTransfer(TransferRequestDto request, Integer senderUserId) {
        // 1. 송금자 조회
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.USER_NOT_FOUND));

        // 2. 송금자 계좌 조회
        Account senderAccount = accountRepository.findByUser(sender)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        // 3. 비밀번호 확인
        if (!passwordEncoder.matches(request.getSendPassword(), senderAccount.getAccountPassword())) {
            throw new CustomException(TransactionErrorCode.INVALID_PASSWORD);
        }

        // 4. 잔액 확인 (SSAFY API 이용)
        Long availableBalance = bankingApiService.getAccountBalance(senderAccount.getAccountNumber());
        if (availableBalance < request.getAmount()) {
            throw new CustomException(TransactionErrorCode.INSUFFICIENT_BALANCE);
        }

        // 5. 수취인 이름 조회
        String recipientName;
        try {
            recipientName = bankingApiService.getAccountHolderName(request.getRecipientAccountNumber());
        } catch (RuntimeException e) {
            throw new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND);
        }

        // 6. SSAFY API 계좌 이체 - summary에 받는 사람 이름 포함
        String summary = recipientName;
        bankingApiService.transfer(
                senderAccount.getAccountNumber(),
                request.getRecipientAccountNumber(),
                request.getAmount(),
                summary
        );

        // 7. 응답 생성
        TransferData data = new TransferData();
        data.setBankName(request.getRecipientBank());
        data.setAccountNumber(request.getRecipientAccountNumber());
        data.setAmount(request.getAmount());
        data.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return new TransferResponseDto("200", "성공적으로 송금되었습니다.", data);
    }

    // 잔액 확인
    public BalanceResponseDto getSenderBalance(Integer senderUserId) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.USER_NOT_FOUND));
        Account senderAccount = accountRepository.findByUser(sender)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        Long balance = bankingApiService.getAccountBalance(senderAccount.getAccountNumber());

        BalanceResponseDto dto = new BalanceResponseDto();
        dto.setBalance(balance);
        dto.setAccountNumber(senderAccount.getAccountNumber());
        dto.setBankName(senderAccount.getBank().getBankName());
        return dto;
    }

}
