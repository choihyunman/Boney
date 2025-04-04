package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ParentQuestRedoService {

    private final QuestRepository questRepository;
    private final ParentChildRepository parentChildRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    // (보호자 페이지) 퀘스트 다시하기
    @Transactional
    public void redoQuest(Integer parentId, Integer questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 부모 소유 검증
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        // 알림 전송: 보호자가 퀘스트 승인 요청을 거절했음을 아이에게 알림
        User child = quest.getParentChild().getChild();
        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(child.getUserId())
                .notificationTypeId(11)  // 11번: QUEST_APPROVAL_REJECTED
                .notificationTitle("퀘스트 승인 거절")
                .notificationContent(quest.getQuestTitle() + " 퀘스트를 다시 확인해 주세요")
                .notificationAmount(null)
                .referenceId(quest.getQuestId())
                .build();
        notificationService.sendNotification(notificationRequest);

        // 첨부된 이미지 URL과 finish_date 초기화
        quest.setQuestImgUrl(null);
        quest.setFinishDate(null);

        // end_date 기준 상태 변경
        LocalDateTime now = LocalDateTime.now();
        if (quest.getEndDate().isAfter(now)) {
            quest.setQuestStatus(QuestStatus.IN_PROGRESS);
        } else {
            quest.setQuestStatus(QuestStatus.FAILED);
        }

        questRepository.save(quest);
    }
}
