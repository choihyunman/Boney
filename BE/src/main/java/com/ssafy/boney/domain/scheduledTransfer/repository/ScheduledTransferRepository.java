package com.ssafy.boney.domain.scheduledTransfer.repository;

import com.ssafy.boney.domain.scheduledTransfer.entity.ScheduledTransfer;
import com.ssafy.boney.domain.user.entity.ParentChild;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Integer> {
    Optional<ScheduledTransfer> findByParentChild(ParentChild parentChild);
    List<ScheduledTransfer> findAllByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate currentDate1, LocalDate currentDate2);
    @Query("select st from ScheduledTransfer st " +
            "where st.startDate <= :today and (st.endDate is null or st.endDate >= :today)")
    List<ScheduledTransfer> findAllActive(@Param("today") LocalDate today);
}
