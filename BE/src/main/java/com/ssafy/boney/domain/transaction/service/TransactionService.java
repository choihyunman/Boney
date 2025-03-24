package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.TransactionResponseDto;
import com.ssafy.boney.domain.transaction.entity.*;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.repository.*;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final HashtagRepository hashtagRepository;
    private final TransactionHashtagRepository transactionHashtagRepository;

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
                        t.getTransactionId(),
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

    public TransactionResponseDto getTransactionDetail(Integer transactionId, User user) {
        // userId(로그인 유저)의 거래내역 중 transactionId가 맞는 것만 조회
        Transaction transaction = transactionRepository
                .findByTransactionIdAndUser_UserId(transactionId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("해당 거래 내역을 찾을 수 없습니다."));

        return new TransactionResponseDto(
                transaction.getTransactionId(),
                transaction.getCreatedAt(),
                transaction.getTransactionContent().getContentName(),
                transaction.getTransactionAmount(),
                transaction.getTransactionType().name(),
                transaction.getTransactionCategory().getTransactionCategoryName(),
                transaction.getTransactionHashtags().stream()
                        .map(th -> th.getHashtag().getName())
                        .collect(Collectors.toList()),
                transaction.getTransactionAfterBalance()
        );
    }

    public void updateTransactionCategory(Integer transactionId, String userEmail, Integer categoryId) {
        // 1) 유저 조회 (또는 SecurityContext 로부터 userId 직접 얻을 수도 있음)
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 2) 해당 거래가 user의 소유인지 확인
        Transaction transaction = transactionRepository
                .findByTransactionIdAndUser_UserId(transactionId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("거래내역을 찾을 수 없습니다."));

        // 3) 새 카테고리 찾기
        TransactionCategory newCategory = transactionCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 카테고리를 찾을 수 없습니다."));

        // 4) 수정
        transaction.updateCategory(newCategory);
        // @Transactional이므로 flush 시점에 DB에 반영
    }

    public void updateTransactionHashtags(Integer transactionId, String userEmail, List<String> newHashtags) {
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        Transaction transaction = transactionRepository
                .findByTransactionIdAndUser_UserId(transactionId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("거래내역을 찾을 수 없습니다."));

        // 해시태그는 최대 3개 예시
        if (newHashtags.size() > 3) {
            throw new IllegalArgumentException("최대 3개의 해시태그만 가능합니다.");
        }

        // 1) 기존 해시태그 관계 삭제 or 업데이트
        // 완전히 교체 로직이라면, 기존 TransactionHashtag를 전부 삭제 후 새로 추가
        transactionHashtagRepository.deleteAllByTransaction(transaction);

        // 2) 새로운 해시태그 엔티티 찾거나 생성 후 TransactionHashtag로 연결
        for (String tagName : newHashtags) {
            // '#' 문자를 떼어내거나, 프로젝트 정책에 맞게 처리
            String cleanName = tagName.startsWith("#") ? tagName.substring(1) : tagName;

            Hashtag hashtag = hashtagRepository.findByName(cleanName)
                    .orElseGet(() -> {
                        // 없으면 새로 만듦
                        Hashtag h = new Hashtag(cleanName);
                        return hashtagRepository.save(h);
                    });

            // TransactionHashtag 연결
            TransactionHashtag newRelation = new TransactionHashtag(transaction, hashtag);
            transactionHashtagRepository.save(newRelation);
        }
    }
}
