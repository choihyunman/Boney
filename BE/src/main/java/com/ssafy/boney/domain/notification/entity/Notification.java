package com.ssafy.boney.domain.notification.entity;

import com.ssafy.boney.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="notification")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_type_id", nullable = false)
    private NotificationType notificationType;

    @Column(name = "notification_title", nullable = false, length = 180)
    private String notificationTitle;

    @Column(name = "notification_content", nullable = false, length = 255)
    private String notificationContent;

    @Column(name = "notification_amount")
    private Long notificationAmount;

    @Column(name = "read_status", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean readStatus;

    @Column(name = "created_at", nullable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "reference_id")
    private Integer referenceId;
}