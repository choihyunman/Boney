package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.notification.dto.NotificationRequest;
import com.ssafy.boney.domain.notification.service.NotificationService;
import com.ssafy.boney.domain.quest.dto.ChildQuestCompletionResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestException;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChildQuestCompletionService {

    private final QuestRepository questRepository;
    private final S3Service s3Service;
    private final NotificationService notificationService;

    // (아이 화면) 퀘스트 완료 요청
    @Transactional
    public ChildQuestCompletionResponse requestQuestCompletion(Integer childId, Integer questId, MultipartFile questImage) {
        LocalDateTime now = LocalDateTime.now();

        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 아이 소유 검증
        if (!quest.getParentChild().getChild().getUserId().equals(childId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        // 재요청 시도 시 예외 발생
        if (quest.getQuestStatus().equals(QuestStatus.WAITING_REWARD)) {
            throw new QuestException(QuestErrorCode.DUPLICATE_COMPLETION_REQUEST);
        }

        if (!quest.getQuestStatus().equals(QuestStatus.IN_PROGRESS)) {
            throw new QuestException(QuestErrorCode.INVALID_STATE_FOR_COMPLETION);
        }

        quest.setFinishDate(now);

        // 이미지 첨부
        if (questImage != null && !questImage.isEmpty()) {
            String imageUrl = s3Service.uploadFile(questImage, "quests");
            quest.setQuestImgUrl(imageUrl);
        }
        // 상태를 WAITING_REWARD로 업데이트
        quest.setQuestStatus(QuestStatus.WAITING_REWARD);

        // (FCM) 보호자에게 완료 요청 알림 전송
        User parent = quest.getParentChild().getParent();
        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(parent.getUserId())
                .notificationTypeId(3) // QUEST_COMPLETION_REQUEST
                .notificationTitle("퀘스트 완료 요청이 왔어요")
                .notificationContent(quest.getParentChild().getChild().getUserName() + "님이 퀘스트 완료 요청을 보냈어요")
                .notificationAmount(null)
                .referenceId(quest.getQuestId())
                .build();
        notificationService.sendNotification(notificationRequest);

        String questCategory = quest.getQuestCategory().getCategoryName();
        String questTitle = quest.getQuestTitle();

        return ChildQuestCompletionResponse.builder()
                .categoryName(questCategory)
                .categoryTitle(questTitle)
                .amount(quest.getQuestReward())
                .finishDate(now)
                .build();
    }
}