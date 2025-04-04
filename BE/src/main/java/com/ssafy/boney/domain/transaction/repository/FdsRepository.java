package com.ssafy.boney.domain.transaction.repository;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.transaction.entity.Fds;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FdsRepository extends JpaRepository<Fds, Integer> {

    // FdsRepository.java
    void deleteAllByAccount(Account account);


}
