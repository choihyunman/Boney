package com.ssafy.boney.domain.notification.repository;

import com.ssafy.boney.domain.notification.entity.Notification;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    void deleteAllByUser(User user);


}
