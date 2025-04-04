package com.ssafy.boney.domain.transaction.repository;
import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.entity.enums.TransactionType;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
    Optional<Transaction> findByTransactionIdAndUser_UserId(Integer transactionId, Integer userId);
    List<Transaction> findByUserAndCreatedAtBetween(User user, LocalDateTime start, LocalDateTime end);

    // 해당 계좌의 거래 금액 평균 계산 (평균값이 없으면 null)
    @Query("SELECT AVG(t.transactionAmount) FROM Transaction t WHERE t.account.accountNumber = :accountNumber")
    Double findAverageTransactionAmount(@Param("accountNumber") String accountNumber);

    // 해당 계좌의 거래 금액 표준편차 (MySQL의 STDDEV_POP 함수 사용)
    @Query(value = "SELECT STDDEV_POP(t.transaction_amount) FROM transaction t WHERE t.account_id = " +
            "(SELECT a.account_id FROM account a WHERE a.account_number = :accountNumber)", nativeQuery = true)
    Double findStdTransactionAmount(@Param("accountNumber") String accountNumber);

    // 특정 시각 이후 해당 계좌의 거래 건수를 계산
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.account.accountNumber = :accountNumber AND t.createdAt >= :since")
    Integer countTransactionsSince(@Param("accountNumber") String accountNumber, @Param("since") LocalDateTime since);

    List<Transaction> findByAccount(Account account);

}