package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.transaction.entity.TransactionContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionContentRepository extends JpaRepository<TransactionContent, Long> {
    Optional<TransactionContent> findByContentName(String contentName);
}
