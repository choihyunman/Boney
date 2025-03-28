package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ParentQuestListResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestListService {

    private final QuestRepository questRepository;


    // 부모 퀘스트 목록 조회 ( IN_PROGRESS, WAITING_REWARD )
    // 보상 대기는 상단, 나머지는 마감일 오름차순
    public List<ParentQuestListResponse> getOngoingQuests(Integer parentId) {
        List<Quest> questEntities = questRepository.findOngoingQuestsByParent(parentId);

        return questEntities.stream()
                .map(q -> new ParentQuestListResponse(
                        q.getQuestId(),
                        q.getParentChild().getChild().getUserName(),
                        q.getQuestTitle(),
                        q.getQuestCategory().getCategoryName(),
                        q.getQuestReward(),
                        q.getQuestStatus().name(),
                        q.getEndDate()
                ))
                .collect(Collectors.toList());
    }
}