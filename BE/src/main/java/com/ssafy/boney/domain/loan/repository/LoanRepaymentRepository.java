package com.ssafy.boney.domain.loan.repository;

import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.entity.LoanRepayment;
import com.ssafy.boney.domain.user.entity.ParentChild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Integer> {

    // Loan 엔티티로 상환 내역 조회
    List<LoanRepayment> findByLoan(Loan loan);

    void deleteAllByLoan(Loan loan);
    void deleteAllByLoan_ParentChild(ParentChild parentChild);

}
