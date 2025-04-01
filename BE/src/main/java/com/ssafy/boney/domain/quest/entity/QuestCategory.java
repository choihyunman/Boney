package com.ssafy.boney.domain.quest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quest_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quest_category_id")
    private Integer questCategoryId;  // PK

    @Column(name = "category_name", nullable = false, length = 45)
    private String categoryName;
}
