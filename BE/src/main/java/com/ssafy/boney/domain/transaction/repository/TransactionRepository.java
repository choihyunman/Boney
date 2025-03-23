package com.ssafy.boney.domain.transaction.repository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @Query("""
        SELECT DISTINCT t FROM Transaction t
        JOIN FETCH t.transactionCategory
        LEFT JOIN FETCH t.transactionHashtags th
        LEFT JOIN FETCH th.hashtag
        WHERE YEAR(t.createdAt) = :year
          AND MONTH(t.createdAt) = :month
          AND (:type IS NULL OR t.transactionType = :type)
          AND t.user.userId = :userId
        ORDER BY t.createdAt DESC
    """)
    List<Transaction> findWithHashtags(int year, int month, TransactionType type, int userId);

    // 외부 거래번호(externalTransactionNo)가 이미 있는지 체크 (중복 방지)
    Optional<Transaction> findByExternalTransactionNo(Integer externalTransactionNo);


}