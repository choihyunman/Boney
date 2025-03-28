package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.QuestChildDetailResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChildQuestDetailService {

    private final QuestRepository questRepository;

    // 아이 퀘스트 상세 조회
    @Transactional(readOnly = true)
    public QuestChildDetailResponse getChildQuestDetail(Integer childId, Integer questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException("해당 아이의 미션을 찾을 수 없습니다."));

        if (!quest.getParentChild().getChild().getUserId().equals(childId)) {
            throw new QuestNotFoundException("해당 아이의 미션을 찾을 수 없습니다.");
        }

        return QuestChildDetailResponse.builder()
                .questId(quest.getQuestId())
                .questTitle(quest.getQuestTitle())
                .questCategory(quest.getQuestCategory().getCategoryName())
                .endDate(quest.getEndDate())
                .questReward(quest.getQuestReward())
                .questImgUrl(quest.getQuestImgUrl())
                .build();
    }
}