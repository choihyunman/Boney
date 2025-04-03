package com.ssafy.boney.domain.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "Notification_Type")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class NotificationType {

    @Id
    @Column(name = "notification_type_id")
    private Integer notificationTypeId;

    @Column(name = "type_code", nullable = false)
    private String typeCode;
}
