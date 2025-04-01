package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.quest.dto.ParentQuestApprovalRequest;
import com.ssafy.boney.domain.quest.dto.ParentQuestApprovalResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.TransactionErrorCode;
import com.ssafy.boney.domain.user.entity.User;
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
    private final CreditScoreService creditScoreService;
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

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
            throw new IllegalArgumentException("해당 퀘스트는 보상 대기 상태가 아닙니다.");
        }

        // 3. 보호자 및 아이 계좌 정보 조회
        User parent = userService.findById(parentId);
        User child = quest.getParentChild().getChild();

        Account parentAccount = accountRepository.findByUser(parent)
                .orElseThrow(() -> new IllegalArgumentException("보호자 계좌 정보가 없습니다."));
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new IllegalArgumentException("아이 계좌정보가 없습니다."));

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
                .bankName(bankName)
                .accountNumber(fromAccount)
                .amount(quest.getQuestReward())
                .transferCreatedAt(nowStr)
                .questTitle(quest.getQuestTitle())
                .questMessage(quest.getQuestMessage())
                .finishDate(nowStr)    // 퀘스트 완료일 (finish_date)
                .approvalDate(nowStr)  // 승인일 (송금 시각)
                .build();

        // 7. 아이 신용점수 증가 (2점)
        creditScoreService.increaseCreditScore(child.getUserId(), 2);

        // 8. 퀘스트 상태 업데이트: SUCCESS, finish_date 기록
        quest.setQuestStatus(QuestStatus.SUCCESS);
        quest.setFinishDate(now);
        questRepository.save(quest);

        return responseDto;
    }
}
