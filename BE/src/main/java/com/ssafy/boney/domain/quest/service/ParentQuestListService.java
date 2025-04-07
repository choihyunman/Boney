package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ParentQuestListResponse;
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
public class ParentQuestListService {

    private final QuestRepository questRepository;

    // (보호자 페이지) 퀘스트 목록 조회 (IN_PROGRESS, WAITING_REWARD)
    // 마감일이 지난 퀘스트의 경우 상태를 FAILED로 변경
    // 보상 대기는 상단, 나머지는 마감일 오름차순
    @Transactional
    public List<ParentQuestListResponse> getOngoingQuests(Integer parentId) {
        LocalDateTime now = LocalDateTime.now();
        // 만료된 진행 중/보상 대기 퀘스트 상태 업데이트
        List<Quest> expiredQuests = questRepository.findExpiredOngoingQuestsForParent(parentId, now);
        for (Quest quest : expiredQuests) {
            quest.setQuestStatus(QuestStatus.FAILED);
            quest.setFinishDate(quest.getEndDate());
        }
        // 이후 진행 중/보상 대기 상태 퀘스트 목록 조회
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