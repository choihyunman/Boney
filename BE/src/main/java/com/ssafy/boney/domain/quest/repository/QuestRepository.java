package com.ssafy.boney.domain.quest.repository;

import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Integer> {


     // 상태가 IN_PROGRESS 또는 WAITING_REWARD인 퀘스트를 조회.
     // 보상 대기(WAITING_REWARD)가 상단, 이후 end_date 오름차순 정렬.
    @Query("SELECT q FROM Quest q " +
            "JOIN q.parentChild pc " +
            "JOIN pc.parent p " +
            "WHERE p.userId = :parentId " +
            "  AND q.questStatus IN ('IN_PROGRESS', 'WAITING_REWARD') " +
            "ORDER BY CASE WHEN q.questStatus = 'WAITING_REWARD' THEN 0 ELSE 1 END, " +
            "         q.endDate ASC")
    List<Quest> findOngoingQuestsByParent(@Param("parentId") Integer parentId);


}