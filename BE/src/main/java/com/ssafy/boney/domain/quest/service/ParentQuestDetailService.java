package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.ParentQuestDetailResponse;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.exception.QuestErrorCode;
import com.ssafy.boney.domain.quest.exception.QuestNotFoundException;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParentQuestDetailService {

    private final QuestRepository questRepository;
    private final UserService userService;

    // (보호자 페이지) 퀘스트 상세 보기
    @Transactional(readOnly = true)
    public ParentQuestDetailResponse getQuestDetail(Integer parentId, Integer questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 보호자의 userId와 퀘스트 보호자의 userId가 일치하는지 확인
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        return ParentQuestDetailResponse.builder()
                .questId(quest.getQuestId())
                .questTitle(quest.getQuestTitle())
                .questCategory(quest.getQuestCategory().getCategoryName())
                .childName(quest.getParentChild().getChild().getUserName())
                .endDate(quest.getEndDate())
                .questReward(quest.getQuestReward())
                .build();
    }


    // 퀘스트 삭제
    @Transactional
    public void deleteQuest(Integer parentId, Integer questId) {
        // 사용자 역할이 보호자인지 확인
        User parent = userService.findById(parentId);
        if (!parent.getRole().equals(com.ssafy.boney.domain.user.entity.enums.Role.PARENT)) {
            throw new IllegalArgumentException("퀘스트는 보호자만 삭제할 수 있습니다.");
        }

        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND));

        // 보호자 소유 검증
        if (!quest.getParentChild().getParent().getUserId().equals(parentId)) {
            throw new QuestNotFoundException(QuestErrorCode.QUEST_NOT_FOUND);
        }

        // 진행 중인 퀘스트만 삭제 가능
        if (!quest.getQuestStatus().equals(QuestStatus.IN_PROGRESS)) {
            throw new IllegalArgumentException("진행 중인 퀘스트만 삭제할 수 있습니다.");
        }

        questRepository.delete(quest);
    }
}
