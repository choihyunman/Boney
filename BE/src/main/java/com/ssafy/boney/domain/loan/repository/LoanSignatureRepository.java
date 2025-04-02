package com.ssafy.boney.domain.loan.repository;

import com.ssafy.boney.domain.loan.entity.LoanSignature;
import com.ssafy.boney.domain.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoanSignatureRepository extends JpaRepository<LoanSignature, Integer> {
    Optional<LoanSignature> findByLoan(Loan loan);


}
