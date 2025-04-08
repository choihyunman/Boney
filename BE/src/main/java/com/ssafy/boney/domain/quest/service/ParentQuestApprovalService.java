package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.domain.quest.dto.ParentQuestApprovalRequest;
import com.ssafy.boney.domain.quest.dto.ParentQuestApprovalResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestException;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import com.ssafy.boney.domain.user.service.CreditScoreService;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ParentQuestApprovalService {

    private final QuestRepository questRepository;
    private final BankingApiService bankingApiService;
    private final CreditScoreRepository creditScoreRepository;
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    // (보호자 페이지) 퀘스트 성공 처리 + 보상 송금
    @Transactional
    public ParentQuestApprovalResponse  approveQuestCompletion(Integer parentId, Integer questId, ParentQuestApprovalRequest approvalRequest) {
        // 1. 퀘스트 조회 및 보호자 소유 검증
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }
        // 2. 상태가 WAITING_REWARD인지 확인
        if (!quest.getQuestStatus().equals(QuestStatus.WAITING_REWARD)) {
            throw new QuestException(QuestErrorCode.INVALID_STATE_FOR_APPROVAL);
        }

        // 3. 보호자 및 아이 계좌 정보 조회
        User parent = userService.findById(parentId);
        User child = quest.getParentChild().getChild();

        Account parentAccount = accountRepository.findByUser(parent)
                .orElseThrow(() -> new QuestException(QuestErrorCode.PARENT_ACCOUNT_NOT_FOUND));
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new QuestException(QuestErrorCode.CHILD_ACCOUNT_NOT_FOUND));

        String fromAccount = parentAccount.getAccountNumber();
        String toAccount = childAccount.getAccountNumber();
        String bankName = parentAccount.getBank().getBankName();

        // 4. 비밀번호 검증
        if (!passwordEncoder.matches(approvalRequest.getSendPassword(), parentAccount.getAccountPassword())) {
            throw new CustomException(TransactionErrorCode.INVALID_PASSWORD);
        }

        // 5. 잔액 검증
        Long rewardAmount = quest.getQuestReward();
        Long availableBalance = bankingApiService.getAccountBalance(parentAccount.getAccountNumber());
        if (availableBalance < rewardAmount) {
            throw new CustomException(TransactionErrorCode.INSUFFICIENT_BALANCE);
        }

        // 6. 송금 실행
        String summary = "퀘스트 " + quest.getQuestTitle();
        bankingApiService.transfer(fromAccount, toAccount, quest.getQuestReward(), summary);

        // 6. 송금 결과 데이터 생성
        LocalDateTime now = LocalDateTime.now();
        String nowStr = now.format(DateTimeFormatter.ISO_DATE_TIME);

        ParentQuestApprovalResponse responseDto = ParentQuestApprovalResponse.builder()
                .childName(quest.getParentChild().getChild().getUserName())
                .bankName(bankName)
                .accountNumber(fromAccount)
                .amount(quest.getQuestReward())
                .transferCreatedAt(nowStr)
                .questTitle(quest.getQuestTitle())
                .questMessage(quest.getQuestMessage())
                .finishDate(nowStr)
                .approvalDate(nowStr)
                .build();

        // 7. 아이 신용점수 증가 (2점)
        CreditScore creditScore = creditScoreRepository.findByUser(child)
                .orElseThrow(() -> new IllegalArgumentException("신용 점수 정보가 없습니다."));
        creditScore.updateScore(2);
        creditScoreRepository.save(creditScore);

        // 8. 퀘스트 상태 업데이트: SUCCESS, finish_date 기록
        quest.setQuestStatus(QuestStatus.SUCCESS);
        quest.setFinishDate(now);
        questRepository.save(quest);

        // (FCM) 아이에게 승인 알림 전송
        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(child.getUserId())
                .notificationTypeId(4) // QUEST_APPROVED
                .notificationTitle("퀘스트 성공!")
                .notificationContent(quest.getQuestTitle() + " 퀘스트를 성공적으로 완료했어요")
                .notificationAmount(quest.getQuestReward())
                .referenceId(quest.getQuestId())
                .build();
        notificationService.sendNotification(notificationRequest);

        return responseDto;
    }
}
