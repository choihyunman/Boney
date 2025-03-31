package com.ssafy.boney.domain.user.repository;

import com.ssafy.boney.domain.user.entity.CreditScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreditScoreRepository extends JpaRepository<CreditScore, Integer> {
    Optional<CreditScore> findByUser_UserId(Integer userId);
}
