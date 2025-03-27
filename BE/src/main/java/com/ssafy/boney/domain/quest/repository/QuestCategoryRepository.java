package com.ssafy.boney.domain.quest.repository;

import com.ssafy.boney.domain.quest.entity.QuestCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestCategoryRepository extends JpaRepository<QuestCategory, Integer> {
}