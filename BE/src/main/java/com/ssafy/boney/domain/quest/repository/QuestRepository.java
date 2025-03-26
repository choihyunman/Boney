package com.ssafy.boney.domain.quest.repository;

import com.ssafy.boney.domain.quest.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestRepository extends JpaRepository<Quest, Integer> {
}
