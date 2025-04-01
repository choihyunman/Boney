package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ChildQuestHistoryResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildQuestHistoryService {

    private final QuestRepository questRepository;

    // (아이 화면) 지난 퀘스트 목록 조회
    @Transactional
    public List<ChildQuestHistoryResponse> getPastQuests(Integer childId) {
        LocalDateTime now = LocalDateTime.now();

        // 만료된 퀘스트 업데이트: IN_PROGRESS 상태인데 마감 시간이 지난 경우
        List<Quest> expiredQuests = questRepository.findExpiredQuestsForChild(childId, now);
        for (Quest quest : expiredQuests) {
            quest.setQuestStatus(QuestStatus.FAILED);
            quest.setFinishDate(quest.getEndDate());
        }

        // 지난 퀘스트 조회 (SUCCESS, FAILED)
        List<Quest> pastQuests = questRepository.findPastQuestsByChild(childId);

        return pastQuests.stream()
                .map(q -> ChildQuestHistoryResponse.builder()
                        .questId(q.getQuestId())
                        .questTitle(q.getQuestTitle())
                        .questCategory(q.getQuestCategory().getCategoryName())
                        .questReward(q.getQuestReward())
                        .questStatus(q.getQuestStatus().name())
                        .endDate(q.getEndDate())
                        .build())
                .collect(Collectors.toList());
    }


}

