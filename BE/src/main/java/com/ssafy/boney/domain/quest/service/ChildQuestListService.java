package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ChildQuestResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildQuestListService {
    private final QuestRepository questRepository;

    // 아이 진행 중인 퀘스트 조회
    public List<ChildQuestResponse> getOngoingQuests(Integer childId) {

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
