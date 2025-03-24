package com.ssafy.boney.domain.account.repository;

import com.ssafy.boney.domain.account.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank, Integer> {
    Optional<Bank> findByBankName(String bankName);


}
