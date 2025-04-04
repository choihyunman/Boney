package com.ssafy.boney.domain.notification.repository;

import com.ssafy.boney.domain.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationTypeRepository extends JpaRepository<NotificationType, Integer> {
}
