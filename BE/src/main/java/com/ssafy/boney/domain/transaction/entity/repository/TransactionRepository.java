package com.ssafy.boney.domain.transaction.entity.repository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @Query("""
        SELECT DISTINCT t
        FROM Transaction t
        JOIN FETCH t.transactionCategory
        LEFT JOIN FETCH t.transactionHashtags th
        LEFT JOIN FETCH th.hashtag
        WHERE YEAR(t.createdAt) = :year
          AND MONTH(t.createdAt) = :month
          AND (:type IS NULL OR t.transactionType = :type)
        ORDER BY t.createdAt DESC
    """)
    List<Transaction> findWithHashtags(int year, int month, TransactionType type);
}
