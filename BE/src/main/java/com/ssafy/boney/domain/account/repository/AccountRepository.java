package com.ssafy.boney.domain.account.repository;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByAccountNumber(String accountNumber);
    Optional<Account> findByUser(User user);

}
