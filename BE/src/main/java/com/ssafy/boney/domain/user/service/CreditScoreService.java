package com.ssafy.boney.domain.user.service;


import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.repository.CreditScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreditScoreService {

    private final CreditScoreRepository creditScoreRepository;

    @Transactional
    public void increaseCreditScore(Integer childId, int increment) {
        CreditScore creditScore = creditScoreRepository.findByUser_UserId(childId)
                .orElseThrow(() -> new RuntimeException("신용점수를 찾을 수 없습니다."));
        creditScore.setScore(creditScore.getScore() + increment);
        creditScore.setUpdatedAt(LocalDateTime.now());
        creditScoreRepository.save(creditScore);
    }
}
