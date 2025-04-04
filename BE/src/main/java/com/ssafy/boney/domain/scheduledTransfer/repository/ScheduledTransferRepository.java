package com.ssafy.boney.domain.scheduledTransfer.repository;

import com.ssafy.boney.domain.scheduledTransfer.entity.ScheduledTransfer;
import com.ssafy.boney.domain.user.entity.ParentChild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Integer> {
    Optional<ScheduledTransfer> findByParentChild(ParentChild parentChild);
}
