package com.ssafy.boney.domain.transaction.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.transaction.dto.*;
import com.ssafy.boney.domain.transaction.entity.*;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
import com.ssafy.boney.domain.transaction.repository.*;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final BankingApiService bankingApiService;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;
    private final TransferRepository transferRepository;
    private final FdsRepository fdsRepository;
    private final TransactionContentRepository transactionContentRepository;
    private final TransactionCategoryRepository transactionCategoryRepository;

    // FastAPI 이상 탐지 호출용 Client
    private final FastApiClient fastApiClient;
    // 이상 탐지 임계치 (예시: 0.8 이상이면 이상 거래로 간주)
    private final double ANOMALY_THRESHOLD = -0.1;

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


    // 잔액 조회
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

        // 6. SSAFY API 계좌 이체 - summary에 보낸 사람(부모)의 이름 포함
        String summary = "이체 " + sender.getUserName();
        TransferApiResponseDto transferApiResponse = bankingApiService.transfer(
                senderAccount.getAccountNumber(),
                request.getRecipientAccountNumber(),
                request.getAmount(),
                summary
        );

//        // 7. transfer API 응답에서 거래 고유번호 추출 (예시: Header 필드의 institutionTransactionUniqueNo)
//        String transactionUniqueNo = transferApiResponse.getRec().get(0).getTransactionUniqueNo();
//
//        // 8. 거래 내역 조회: inquiryTransactionHistory API 호출
//        TransactionHistoryResponseDto historyResponse = bankingApiService.inquireTransactionHistory(
//                senderAccount.getAccountNumber(), transactionUniqueNo
//        );
//
//        // 9. 거래 내역 DB 저장
//        Transaction transactionEntity = convertToTransactionEntity(historyResponse, senderAccount, sender);
//        transactionEntity = transactionRepository.save(transactionEntity);
//        Transfer transferRecord = Transfer.builder()
//                .account(senderAccount)
//                .transaction(transactionEntity)
//                .transactionCounterparty(request.getRecipientAccountNumber())
//                .build();
//        transferRecord = transferRepository.save(transferRecord);
//
//        // 10. FastAPI 이상 탐지 호출 (추가 Feature 포함)
//        AnomalyRequestDto anomalyRequest = buildAnomalyRequest(transferRecord, transactionEntity, senderAccount, request);
//        AnomalyResponseDto anomalyResponse = fastApiClient.detectAnomaly(anomalyRequest);
//
//        // 11. 이상 거래 결과에 따른 처리
//        if (anomalyResponse.getAnomaly()) {
//            Fds fdsRecord = Fds.builder()
//                    .transaction(transactionEntity)
//                    .account(senderAccount)
//                    .fdsReason("이체 이상 거래 의심: 점수 " + anomalyResponse.getScore())
//                    .build();
//            fdsRepository.save(fdsRecord);
//        }

        TransferData data = new TransferData();
        data.setBankName(request.getRecipientBank());
        data.setAccountNumber(request.getRecipientAccountNumber());
        data.setAmount(request.getAmount());
        data.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return new TransferResponseDto("200", "성공적으로 송금되었습니다.", data);
    }

    // 보호자 -> 아이 용돈 지급
    @Transactional
    public ParentChildTransferResponseDto processParentChildTransfer(ParentChildTransferRequestDto request, Integer parentUserId) {
        // 1. 보호자 조회
        User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.USER_NOT_FOUND));

        // 2. 보호자 계좌 조회
        Account parentAccount = accountRepository.findByUser(parent)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        // 3. 보호자 계좌 비밀번호 확인
        if (!passwordEncoder.matches(request.getSendPassword(), parentAccount.getAccountPassword())) {
            throw new CustomException(TransactionErrorCode.INVALID_PASSWORD);
        }

        // 4. 보호자 계좌 잔액 확인
        Long availableBalance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());
        if (availableBalance < request.getAmount()) {
            throw new CustomException(TransactionErrorCode.INSUFFICIENT_BALANCE);
        }

        // 5. 아이 조회
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new CustomException(TransactionErrorCode.USER_NOT_FOUND));

        // 6. 아이 계좌 조회
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new CustomException(TransactionErrorCode.ACCOUNT_NOT_FOUND));

        // 7. SSAFY API 계좌 이체
        String summary = "용돈 " + parent.getUserName();
        bankingApiService.transfer(
                parentAccount.getAccountNumber(),
                childAccount.getAccountNumber(),
                request.getAmount(),
                summary
        );

        // 8. 응답 생성
        ParentChildTransferResponseDto response = new ParentChildTransferResponseDto();
        response.setAccountNumber(childAccount.getAccountNumber());
        response.setChildName(child.getUserName());

        return response;
    }

    private Transaction convertToTransactionEntity(TransactionHistoryResponseDto history, Account senderAccount, User sender) {
        Integer externalTransactionNo = Integer.valueOf(history.getRec().getTransactionUniqueNo());
        Long transactionAmount = Long.valueOf(history.getRec().getTransactionBalance());
        Long transactionAfterBalance = Long.valueOf(history.getRec().getTransactionAfterBalance());
        LocalDateTime createdAt = LocalDateTime.parse(
                history.getRec().getTransactionDate() + history.getRec().getTransactionTime(),
                DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        );
        TransactionType transactionType = TransactionType.WITHDRAWAL; // 전송이므로 출금 타입

        // 거래 내용 조회
        TransactionContent transactionContent = transactionContentRepository.findByContentName("이체")
                .orElseThrow(() -> new RuntimeException("TransactionContent not found"));
        // TransactionContent의 외래키로 연결된 기본 거래 카테고리 사용
        TransactionCategory transactionCategory = transactionContent.getDefaultTransactionCategory();

        return Transaction.createTransaction(
                externalTransactionNo,
                transactionAmount,
                transactionAfterBalance,
                createdAt,
                transactionType,
                senderAccount,
                sender,
                transactionContent,
                transactionCategory
        );
    }

    private AnomalyRequestDto buildAnomalyRequest(Transfer transferRecord, Transaction transactionEntity, Account senderAccount, TransferRequestDto request) {
        AnomalyRequestDto dto = new AnomalyRequestDto();
        dto.setTransferId(transferRecord.getTransferId());
        dto.setSenderAccount(senderAccount.getAccountNumber());
        dto.setRecipientAccount(request.getRecipientAccountNumber());
        dto.setAmount(request.getAmount());
        dto.setCreatedAt(transactionEntity.getCreatedAt());

        // 1. 평균, 표준편차 계산
        Double avgAmount = transactionRepository.findAverageTransactionAmount(senderAccount.getAccountNumber());
        Double stdAmount = transactionRepository.findStdTransactionAmount(senderAccount.getAccountNumber());
        dto.setAverageTransactionAmount(avgAmount != null ? avgAmount : 0.0);
        dto.setStdDevTransactionAmount(stdAmount != null ? stdAmount : 0.0);
        dto.setAmountRatio((avgAmount != null && avgAmount > 0) ? (request.getAmount() / avgAmount) : 1.0);

        // 2. 최근 거래 건수 (예: 최근 10분, 1시간)
        LocalDateTime now = LocalDateTime.now();
        Integer count10Min = transactionRepository.countTransactionsSince(senderAccount.getAccountNumber(), now.minusMinutes(10));
        Integer count1Hour = transactionRepository.countTransactionsSince(senderAccount.getAccountNumber(), now.minusHours(1));
        dto.setTransactionCountLast10Minutes(count10Min);
        dto.setTransactionCountLastHour(count1Hour);

        // 3. 동일 수취인과의 이전 거래 시간 차 (분)
        // TransferRepository를 이용하여 마지막 거래 시간 조회
        Optional<LocalDateTime> lastTimeOpt = transferRepository.findLastTransactionTime(senderAccount.getAccountNumber(), request.getRecipientAccountNumber());
        if(lastTimeOpt.isPresent()) {
            long gap = java.time.Duration.between(lastTimeOpt.get(), transactionEntity.getCreatedAt()).toMinutes();
            dto.setTimeGapMinutes(gap);
            dto.setNewRecipientFlag(false);
        } else {
            dto.setTimeGapMinutes(-1L); // 첫 거래임을 표시
            dto.setNewRecipientFlag(true);
        }

        // 4. 거래 시간 및 요일
        dto.setTransactionHour(transactionEntity.getCreatedAt().getHour());

        // 5. 거래 카테고리
        dto.setTransactionCategory(transactionEntity.getTransactionCategory().getTransactionCategoryName());

        return dto;
    }


}
