package com.ssafy.boney.domain.quest.service;

import com.ssafy.boney.domain.quest.dto.QuestChildResponseDto;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

// 보호자 아이 목록 조회
@Service
@RequiredArgsConstructor
public class QuestChildService {

    private final ParentChildRepository parentChildRepository;

    public List<QuestChildResponseDto> getChildrenForQuest(User parent) {
        List<ParentChild> parentChildList = parentChildRepository.findByParent(parent);

        // 생년월일 오름차순 정렬
        parentChildList.sort(Comparator.comparing(pc -> pc.getChild().getUserBirth()));
        return parentChildList.stream()
                .map(pc -> new QuestChildResponseDto(
                        pc.getParentChildId(),
                        pc.getChild().getUserId(),
                        pc.getChild().getUserName()))
                .collect(Collectors.toList());
    }


}