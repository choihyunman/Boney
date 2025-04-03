package com.ssafy.boney.domain.quest.dto;

import com.ssafy.boney.domain.user.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ParentQuestChildResponse {
    private Integer parentChildId;
    private Integer childId;
    private String childName;
    private Gender childGender;
}