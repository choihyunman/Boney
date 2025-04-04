package com.ssafy.boney.domain.loan.repository;

import com.ssafy.boney.domain.loan.entity.LoanSignature;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.enums.SignerType;
import com.ssafy.boney.domain.user.entity.ParentChild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoanSignatureRepository extends JpaRepository<LoanSignature, Integer> {
    Optional<LoanSignature> findByLoan(Loan loan);
    Optional<LoanSignature> findByLoanAndSignerType(Loan loan, SignerType signerType);

    void deleteAllByLoan(Loan loan);

    void deleteAllByLoan_ParentChild(ParentChild parentChild);


}
