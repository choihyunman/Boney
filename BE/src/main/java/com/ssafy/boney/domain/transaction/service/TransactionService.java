package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.transaction.entity.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 거래 내역 조회 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<TransactionResponseDto> getTransactions(int year, int month, String typeStr) {
        TransactionType type = "all".equalsIgnoreCase(typeStr) ? null : TransactionType.valueOf(typeStr.toUpperCase());

        List<Transaction> transactions = transactionRepository.findWithHashtags(year, month, type);
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("조회할 거래 내역이 없습니다.");
        }

        return transactions.stream()
                .map(t -> new TransactionResponseDto(
                        t.getTransactionId().longValue(),
                        t.getCreatedAt(),
                        t.getTransactionContent(),
                        t.getTransactionAmount(),
                        t.getTransactionType().name(),
                        t.getTransactionCategory().getTransactionCategoryName(),
                        t.getTransactionHashtags().stream()
                                .map(th -> th.getHashtag().getName())
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }
}
