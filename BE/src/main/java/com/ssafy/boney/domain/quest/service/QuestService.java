package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.QuestCreateRequest;
import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.QuestCategory;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.quest.repository.QuestCategoryRepository;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QuestService {

    private final QuestRepository questRepository;
    private final ParentChildRepository parentChildRepository;
    private final QuestCategoryRepository questCategoryRepository;
    private final UserService userService;

    // 퀘스트 생성
    public void createQuest(Integer parentId, QuestCreateRequest requestDto) {
        // 1) 부모 엔티티 조회
        User parent = userService.findById(parentId);
        if (parent == null) {
            throw new IllegalArgumentException("보호자 정보를 찾을 수 없습니다.");
        }

        // 2) parent_child_id 유효성 검사
        ParentChild parentChild = parentChildRepository.findById(requestDto.getParentChildId())
                .orElseThrow(() -> new IllegalArgumentException("보호자-아이 관계를 찾을 수 없습니다."));
        if (!parentChild.getParent().getUserId().equals(parentId)) {
            throw new IllegalArgumentException("보호자와 아이 관계가 일치하지 않습니다.");
        }

        // 3) 퀘스트 카테고리 조회
        QuestCategory questCategory = questCategoryRepository.findById(requestDto.getQuestCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("퀘스트 카테고리를 찾을 수 없습니다."));

        Quest quest = Quest.builder()
                .parentChild(parentChild)
                .questCategory(questCategory)
                .questTitle(requestDto.getQuestTitle())
                .questMessage(requestDto.getQuestMessage())
                .questReward(requestDto.getQuestReward())
                .questStatus(QuestStatus.IN_PROGRESS) // 초기 상태
                .createdAt(LocalDateTime.now())
                .endDate(requestDto.getEndDate())
                .build();

        questRepository.save(quest);
    }


}