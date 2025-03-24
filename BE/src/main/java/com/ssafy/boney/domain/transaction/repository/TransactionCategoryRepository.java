package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.transaction.entity.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionCategoryRepository extends JpaRepository<TransactionCategory, Integer> {
    Optional<TransactionCategory> findByTransactionCategoryName(String transactionCategoryName);
}
