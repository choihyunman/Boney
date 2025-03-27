package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.QuestDetailResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestDetailService {

    private final QuestRepository questRepository;

    @Transactional(readOnly = true)
    public QuestDetailResponse getQuestDetail(Integer parentId, Integer questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException("해당 퀘스트를 찾을 수 없습니다."));

        // 요청 부모의 userId와 퀘스트의 부모의 userId가 일치하는지 확인
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException("해당 퀘스트를 찾을 수 없습니다.");
        }

        return QuestDetailResponse.builder()
                .questId(quest.getQuestId())
                .questTitle(quest.getQuestTitle())
                .questCategory(quest.getQuestCategory().getCategoryName())
                .childName(quest.getParentChild().getChild().getUserName())
                .endDate(quest.getEndDate())
                .questReward(quest.getQuestReward())
                .build();
    }
}
