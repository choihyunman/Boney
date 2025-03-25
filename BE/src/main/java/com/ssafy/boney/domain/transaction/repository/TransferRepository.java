package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.transaction.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransferRepository extends JpaRepository<Transfer, Integer> {
}
