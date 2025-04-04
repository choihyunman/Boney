package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.transaction.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TransferRepository extends JpaRepository<Transfer, Integer> {
    // 해당 계좌에서, 특정 수취인과의 거래 중 가장 최신(createdAt이 가장 큰) 거래 시각
    @Query("SELECT MAX(t.transaction.createdAt) FROM Transfer t WHERE t.account.accountNumber = :accountNumber AND t.transactionCounterparty = :recipientAccount")
    Optional<LocalDateTime> findLastTransactionTime(@Param("accountNumber") String accountNumber,
                                                    @Param("recipientAccount") String recipientAccount);

    // TransferRepository.java
    void deleteAllByAccount(Account account);


}

