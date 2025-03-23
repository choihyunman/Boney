package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.TransactionHashtag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionHashtagRepository extends JpaRepository<TransactionHashtag, Long> {
    void deleteAllByTransaction(Transaction transaction);
}