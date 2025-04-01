package com.ssafy.boney.domain.quest.entity;

import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import com.ssafy.boney.domain.user.entity.ParentChild;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quest")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quest_id")
    private Integer questId;  // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quest_category_id", nullable = false)
    private QuestCategory questCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_child_id", nullable = false)
    private ParentChild parentChild;

    @Column(name = "quest_title", nullable = false, length = 45)
    private String questTitle;

    @Column(name = "quest_message")
    private String questMessage;

    @Column(name = "quest_reward", nullable = false)
    private Long questReward;

    @Enumerated(EnumType.STRING)
    @Column(name = "quest_status", nullable = false)
    private QuestStatus questStatus;

    @Column(name = "quest_img_url", length = 200)
    private String questImgUrl;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "finish_date")
    private LocalDateTime finishDate;

    @Column(name = "accept_date")
    private LocalDateTime acceptDate;
}
