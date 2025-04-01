package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ParentQuestRedoService {

    private final QuestRepository questRepository;

    @Transactional
    public void redoQuest(Integer parentId, Integer questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 부모 소유 검증
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        // 첨부된 이미지 URL과 finish_date 초기화
        quest.setQuestImgUrl(null);
        quest.setFinishDate(null);

        // end_date 기준 상태 변경
        LocalDateTime now = LocalDateTime.now();
        if (quest.getEndDate().isAfter(now)) {
            quest.setQuestStatus(QuestStatus.IN_PROGRESS);
        } else {
            quest.setQuestStatus(QuestStatus.FAILED);
        }

        questRepository.save(quest);
    }
}
