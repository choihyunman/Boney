package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ParentQuestHistoryResponse;
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
public class ParentQuestHistoryService {

    private final QuestRepository questRepository;

    // 1) 만료된 퀘스트 갱신 (IN_PROGRESS -> FAILED, finish_date = end_date)
    // 2) SUCCESS or FAILED 상태의 지난 퀘스트 목록 조회
    @Transactional
    public List<ParentQuestHistoryResponse> getPastQuests(Integer parentId) {
        // (1) 조회 시점에 만료된 퀘스트를 FAILED로 업데이트
        LocalDateTime now = LocalDateTime.now();
        List<Quest> expiredQuests = questRepository.findExpiredQuestsForParent(parentId, now);

        for (Quest quest : expiredQuests) {
            quest.setQuestStatus(QuestStatus.FAILED);
            quest.setFinishDate(quest.getEndDate());
        }

        // (2) 지난 퀘스트 목록 조회 (SUCCESS, FAILED)
        List<Quest> pastQuests = questRepository.findPastQuestsByParent(parentId);

        return pastQuests.stream()
                .map(q -> new ParentQuestHistoryResponse(
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