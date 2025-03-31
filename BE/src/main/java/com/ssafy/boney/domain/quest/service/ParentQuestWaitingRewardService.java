package com.ssafy.boney.domain.quest.service;


import com.ssafy.boney.domain.quest.dto.ParentWaitingRewardResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParentQuestWaitingRewardService {

    private final QuestRepository questRepository;

    // (보호자 페이지) 보상 대기 중 퀘스트 조회
    @Transactional(readOnly = true)
    public ParentWaitingRewardResponse getWaitingRewardQuest(Integer parentId, Integer questId) {
        // 1) 퀘스트 조회
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 2) 보호자 확인
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        // 3) 퀘스트 상태 확인
        if (!quest.getQuestStatus().equals(QuestStatus.WAITING_REWARD)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        return ParentWaitingRewardResponse.builder()
                .questId(quest.getQuestId())
                .questTitle(quest.getQuestTitle())
                .questCategory(quest.getQuestCategory().getCategoryName())
                .childName(quest.getParentChild().getChild().getUserName())
                .childId(quest.getParentChild().getChild().getUserId())
                .endDate(quest.getEndDate())
                .questReward(quest.getQuestReward())
                .questStatus(quest.getQuestStatus().name()) // "WAITING_REWARD"
                .questImgUrl(quest.getQuestImgUrl())
                .build();
    }
}
