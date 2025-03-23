package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.user.dto.ChildResponse;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.exception.UserConflictException;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentChildService {

    private final UserRepository userRepository;
    private final ParentChildRepository parentChildRepository;
    private final LoanRepository loanRepository;

    // 아이 등록
    public void registerChild(Integer parentId, String childEmail, String childPhone) {
        // 보호자 조회
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
        // 이메일 + 휴대폰 일치하는 아이 조회
        Optional<User> childOpt = userRepository.findByUserEmailAndUserPhone(childEmail, childPhone);
        if (!childOpt.isPresent()) {
            throw new UserNotFoundException(UserErrorCode.NOT_FOUND);
        }
        User child = childOpt.get();
        // 이미 등록된 보호자-아이 관계인지 확인
        if (parentChildRepository.existsByParentAndChild(parent, child)) {
            throw new UserConflictException(UserErrorCode.CONFLICT);
        }
        // 보호자-아이 관계 생성
        ParentChild parentChild = ParentChild.builder()
                .parent(parent)
                .child(child)
                .createdAt(LocalDateTime.now())
                .build();
        parentChildRepository.save(parentChild);
    }

    // 아이 목록 조회 - 생년월일 순 정렬
    public List<ChildResponse> getChildrenByParentId(Integer parentId) {
        // 보호자 조회
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
        // 보호자-아이 관계 조회
        List<ParentChild> relations = parentChildRepository.findByParent(parent);
        return relations.stream()
                .map(relation -> {
                    User child = relation.getChild();
                    // 신용 점수 반환
                    Integer score = (child.getCreditScore() != null) ? child.getCreditScore().getScore() : null;
                    // 각 아이의 잔여 대출금 합 반환
                    List<Loan> loans = loanRepository.findByParentChild(relation);
                    Long totalRemaining = loans.stream()
                            .mapToLong(loan -> loan.getLastAmount() != null ? loan.getLastAmount() : 0L)
                            .sum();
                    String totalRemainingLoan = String.valueOf(totalRemaining);
                    return new ChildResponse(child, score, totalRemainingLoan);
                })
                // 생일 기준 정렬
                .sorted(Comparator.comparing(ChildResponse::getUserBirth))
                .collect(Collectors.toList());
    }
}
