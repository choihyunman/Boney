package com.ssafy.boney.domain.quest.repository;

import com.ssafy.boney.domain.quest.entity.Quest;
import com.ssafy.boney.domain.quest.entity.enums.QuestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Integer> {

    // 보호자 퀘스트 목록
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


    // 지난 퀘스트 목록
    // (1) 만료된 퀘스트 조회:
    // IN_PROGRESS 상태이면서, end_date가 현재 시각보다 이전인 항목
    @Query("SELECT q FROM Quest q " +
            "JOIN q.parentChild pc " +
            "JOIN pc.parent p " +
            "WHERE p.userId = :parentId " +
            "  AND q.questStatus = 'IN_PROGRESS' " +
            "  AND q.endDate < :now")
    List<Quest> findExpiredQuestsForParent(@Param("parentId") Integer parentId,
                                           @Param("now") LocalDateTime now);

     // (2) 지난 퀘스트 조회:
     // SUCCESS, FAILED 상태인 항목만 + finish_date 기준 내림차순 정렬 (null은 마지막)
    @Query("SELECT q FROM Quest q " +
            "JOIN q.parentChild pc " +
            "JOIN pc.parent p " +
            "WHERE p.userId = :parentId " +
            "  AND q.questStatus IN ('SUCCESS','FAILED') " +
            "ORDER BY CASE WHEN q.finishDate IS NULL THEN 1 ELSE 0 END, " +
            "         q.finishDate DESC")
    List<Quest> findPastQuestsByParent(@Param("parentId") Integer parentId);


    // 아이 퀘스트 목록
    @Query("SELECT q FROM Quest q " +
            "JOIN q.parentChild pc " +
            "JOIN pc.child c " +
            "WHERE c.userId = :childId " +
            "  AND q.questStatus IN ('IN_PROGRESS','WAITING_REWARD') " +
            "ORDER BY CASE WHEN q.questStatus = 'WAITING_REWARD' THEN 0 ELSE 1 END, " +
            "         q.endDate ASC")
    List<Quest> findOngoingQuestsByChild(@Param("childId") Integer childId);
}




