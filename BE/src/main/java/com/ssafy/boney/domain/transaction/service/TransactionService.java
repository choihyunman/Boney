package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.TransactionCategory;
import com.ssafy.boney.domain.transaction.entity.TransactionContent;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.repository.TransactionCategoryRepository;
import com.ssafy.boney.domain.transaction.repository.TransactionContentRepository;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ExternalApiService externalApiService;
    private final AccountRepository accountRepository;
    private final TransactionCategoryRepository transactionCategoryRepository;
    private final TransactionContentRepository transactionContentRepository;

    /**
     * 외부 API와 데이터를 동기화하고, 트랜잭션 데이터를 DB에 저장
     */
    public void syncExternalTransactions(String accountNo, int year, int month) {
        // 요청 날짜 범위 생성 (월의 시작일~말일)
        String startDate = String.format("%04d%02d01", year, month);
        String endDate = LocalDate.of(year, month, 1)
                .withDayOfMonth(LocalDate.of(year, month, 1).lengthOfMonth())
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 외부 API 데이터 호출
        Map<String, Object> externalData = externalApiService.getExternalTransactionHistory(accountNo, startDate, endDate);
        Map<String, Object> rec = (Map<String, Object>) externalData.get("REC");
        List<Map<String, String>> transactions = (List<Map<String, String>>) rec.get("list");

        // 3) Account 조회
        Account account = accountRepository.findByAccountNumber(accountNo)
                .orElseThrow(() -> new ResourceNotFoundException("계좌 정보를 찾을 수 없습니다."));

        // 4) 반복문으로 외부 거래 처리
        for (Map<String, String> tx : transactions) {
            Integer externalNo = Integer.valueOf(tx.get("transactionUniqueNo"));

            // 이미 저장된 거래인지 검사
            if (transactionRepository.findByExternalTransactionNo(externalNo).isPresent()) {
                continue;
            }

            // 가맹점명(또는 기타 요약 정보) 추출
            String summary = tx.get("transactionSummary");

            Long afterBalance = null;
            if (tx.containsKey("transactionAfterBalance")) {
                afterBalance = Long.parseLong(tx.get("transactionAfterBalance"));
            }

            // TransactionContent 확인 (없으면 "기타"로 처리)
            TransactionContent content = transactionContentRepository
                    .findByContentName(summary)
                    .orElseGet(() -> {
                        return transactionContentRepository.findByContentName("기타")
                                .orElseThrow(() -> new ResourceNotFoundException("카테고리에 기타가 존재하지 않습니다"));
                    });

            // 최종 카테고리 결정 (기본값)
            TransactionCategory mappedCategory = content.getDefaultTransactionCategory();

            // "transactionType"이 "1"이면 입금, "2"이면 출금
            TransactionType transType = "1".equals(tx.get("transactionType"))
                    ? TransactionType.DEPOSIT
                    : TransactionType.WITHDRAWAL;

            // 날짜+시간 파싱
            LocalDateTime parsedDateTime = LocalDateTime.parse(
                    tx.get("transactionDate") + tx.get("transactionTime"),
                    DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
            );

            // 엔티티 생성
            Transaction transaction = Transaction.createTransaction(
                    externalNo,
                    Long.parseLong(tx.get("transactionBalance")),
                    afterBalance,
                    parsedDateTime,
                    transType,
                    account,
                    account.getUser(),
                    content,
                    mappedCategory
            );

            // 저장
            transactionRepository.save(transaction);
        }
    }

    /**
     * 연도, 월, 타입으로 거래내역 조회
     */
    public List<TransactionResponseDto> getTransactions(int year, int month, String typeStr, User user) {
        TransactionType type = "all".equalsIgnoreCase(typeStr)
                ? null
                : TransactionType.valueOf(typeStr.toUpperCase());

        List<Transaction> transactions = transactionRepository.findWithHashtags(year, month, type, user.getUserId());
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("조회할 거래 내역이 없습니다.");
        }

        return transactions.stream()
                .map(t -> new TransactionResponseDto(
                        t.getTransactionId().longValue(),
                        t.getCreatedAt(),
                        // 가맹점명 or 기타
                        t.getTransactionContent().getContentName(),
                        t.getTransactionAmount(),
                        t.getTransactionType().name(),
                        t.getTransactionCategory().getTransactionCategoryName(),
                        t.getTransactionHashtags().stream()
                                .map(th -> th.getHashtag().getName())
                                .collect(Collectors.toList()),
                        t.getTransactionAfterBalance()
                ))
                .collect(Collectors.toList());
    }
}
