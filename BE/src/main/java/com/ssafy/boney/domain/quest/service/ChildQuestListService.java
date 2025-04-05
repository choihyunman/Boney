package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ChildQuestResponse;
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
public class ChildQuestListService {
    private final QuestRepository questRepository;

    // (아이 화면) 진행 중인 퀘스트 조회
    @Transactional
    public List<ChildQuestResponse> getOngoingQuests(Integer childId) {
        LocalDateTime now = LocalDateTime.now();
        // 만료된 진행 중/보상 대기 퀘스트 상태 업데이트
        List<Quest> expiredQuests = questRepository.findExpiredOngoingQuestsForChild(childId, now);
        for (Quest quest : expiredQuests) {
            quest.setQuestStatus(QuestStatus.FAILED);
            quest.setFinishDate(quest.getEndDate());
        }
        // 이후 진행 중/보상 대기 상태 퀘스트 목록 조회
        List<Quest> quests = questRepository.findOngoingQuestsByChild(childId);
        return quests.stream()
                .map(q -> new ChildQuestResponse(
                        q.getQuestId(),
                        q.getQuestTitle(),
                        q.getQuestCategory().getCategoryName(),
                        q.getQuestReward(),
                        q.getQuestStatus().name(),
                        q.getEndDate()
                ))
                .collect(Collectors.toList());
    }
}