package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.domain.quest.dto.ParentQuestCreateRequest;
import com.ssafy.boney.domain.quest.dto.ParentQuestCreateResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.QuestCategory;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestException;
import com.ssafy.boney.domain.quest.repository.QuestCategoryRepository;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ParentQuestService {

    private final QuestRepository questRepository;
    private final ParentChildRepository parentChildRepository;
    private final QuestCategoryRepository questCategoryRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    // (보호자 페이지) 퀘스트 생성
    public ParentQuestCreateResponse createQuest(Integer parentId, ParentQuestCreateRequest requestDto) {
        // 1) 보호자 엔티티 조회
        User parent = userService.findById(parentId);
        if (parent == null) {
            throw new QuestException(QuestErrorCode.PARENT_NOT_FOUND);
        }

        // 2) parent_child_id 유효성 검사
        ParentChild parentChild = parentChildRepository.findById(requestDto.getParentChildId())
                .orElseThrow(() -> new QuestException(QuestErrorCode.PARENT_CHILD_RELATION_INVALID));
        if (!parentChild.getParent().getUserId().equals(parentId)) {
            throw new QuestException(QuestErrorCode.PARENT_CHILD_RELATION_INVALID);
        }

        // 3) 퀘스트 카테고리 조회
        QuestCategory questCategory = questCategoryRepository.findById(requestDto.getQuestCategoryId())
                .orElseThrow(() -> new QuestException(QuestErrorCode.CATEGORY_NOT_FOUND));

        LocalDateTime endDateTime = requestDto.getEndDate().atTime(23, 59, 59);

        Quest quest = Quest.builder()
                .parentChild(parentChild)
                .questCategory(questCategory)
                .questTitle(requestDto.getQuestTitle())
                .questMessage(requestDto.getQuestMessage())
                .questReward(requestDto.getQuestReward())
                .questStatus(QuestStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now())
                .endDate(endDateTime)
                .build();

        questRepository.save(quest);

        // (FCM) 아이에게 퀘스트 등록 알림 전송
        User child = parentChild.getChild();
        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(child.getUserId())
                .notificationTypeId(2) // QUEST_REGISTERED
                .notificationTitle("새로운 퀘스트가 등록되었어요")
                .notificationContent(parent.getUserName() + "님이 새로운 퀘스트를 등록했어요")
                .notificationAmount(quest.getQuestReward())
                .referenceId(quest.getQuestId())
                .build();
        notificationService.sendNotification(notificationRequest);

        return ParentQuestCreateResponse.builder()
                .childName(parentChild.getChild().getUserName())
                .questCategory(questCategory.getCategoryName())
                .questTitle(quest.getQuestTitle())
                .questReward(quest.getQuestReward())
                .endDate(quest.getEndDate().toLocalDate())
                .questMessage(quest.getQuestMessage())
                .build();
    }


}