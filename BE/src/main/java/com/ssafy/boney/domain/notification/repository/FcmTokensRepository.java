package com.ssafy.boney.domain.notification.repository;

import com.ssafy.boney.domain.notification.entity.FcmTokens;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokensRepository extends JpaRepository<FcmTokens, Integer> {
    List<FcmTokens> findByUser(User user);
    Optional<FcmTokens> findByUserAndFcmToken(User user, String fcmToken);
}
