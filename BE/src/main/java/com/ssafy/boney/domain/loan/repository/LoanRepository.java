package com.ssafy.boney.domain.loan.repository;

import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Integer> {
    List<Loan> findByParentChild(ParentChild parentChild);
    List<Loan> findByParentChild_Child(User child);
}
