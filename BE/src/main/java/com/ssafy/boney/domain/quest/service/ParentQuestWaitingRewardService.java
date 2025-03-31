package com.ssafy.boney.domain.quest.service;


import com.ssafy.boney.domain.quest.dto.ParentWaitingRewardResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParentQuestWaitingRewardService {

    private final QuestRepository questRepository;

    @Transactional(readOnly = true)
    public ParentWaitingRewardResponse getWaitingRewardQuest(Integer parentId, Integer questId) {
        // 1) 퀘스트 조회
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException("해당 퀘스트가 보상 대기 상태가 아닙니다."));

        // 2) 부모 소유 확인
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            // 동일한 메시지로 처리할지, 별도 메시지로 처리할지 선택
            throw new QuestNotFoundException("해당 퀘스트가 보상 대기 상태가 아닙니다.");
        }

        // 3) 보상 대기 상태인지 확인
        if (!quest.getQuestStatus().equals(QuestStatus.WAITING_REWARD)) {
            throw new QuestNotFoundException("해당 퀘스트가 보상 대기 상태가 아닙니다.");
        }

        // 4) DTO 변환 후 반환
        return ParentWaitingRewardResponse.builder()
                .questId(quest.getQuestId())
                .questTitle(quest.getQuestTitle())
                .questCategory(quest.getQuestCategory().getCategoryName())
                .childName(quest.getParentChild().getChild().getUserName())
                .endDate(quest.getEndDate())
                .questReward(quest.getQuestReward())
                .questStatus(quest.getQuestStatus().name()) // "WAITING_REWARD"
                .questImgUrl(quest.getQuestImgUrl())
                .build();
    }
}
