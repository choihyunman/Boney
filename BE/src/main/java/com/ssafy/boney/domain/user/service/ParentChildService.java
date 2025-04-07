package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.loan.entity.Loan;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.scheduledTransfer.entity.ScheduledTransfer;
import com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferCycle;
import com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferStatus;
import com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferWeekday;
import com.ssafy.boney.domain.scheduledTransfer.exception.ResourceAlreadyExistsException;
import com.ssafy.boney.domain.transaction.exception.CustomException;
import com.ssafy.boney.domain.transaction.exception.ResourceNotFoundException;
import com.ssafy.boney.domain.user.dto.ChildResponse;
import com.ssafy.boney.domain.user.dto.RegularTransferResponse;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.exception.UserConflictException;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.UserRepository;
import com.ssafy.boney.domain.scheduledTransfer.repository.ScheduledTransferRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ssafy.boney.domain.user.dto.ChildrenDetailResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferWeekday.*;

@Service
@RequiredArgsConstructor
public class ParentChildService {

    private final UserRepository userRepository;
    private final ParentChildRepository parentChildRepository;
    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final ScheduledTransferRepository scheduledTransferRepository;

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
                    // 자녀의 계좌 정보 조회 (존재할 경우)
                    Account childAccount = accountRepository.findByUser(child).orElse(null);
                    String bankName = (childAccount != null && childAccount.getBank() != null)
                            ? childAccount.getBank().getBankName() : null;
                    String accountNumber = (childAccount != null)
                            ? childAccount.getAccountNumber() : null;

                    return ChildResponse.builder()
                            .userId(child.getUserId())
                            .userName(child.getUserName())
                            .userBirth(child.getUserBirth())
                            .userGender(child.getUserGender().toString())
                            .userPhone(child.getUserPhone())
                            .score(score)
                            .totalRemainingLoan(totalRemainingLoan)
                            .createdAt(relation.getCreatedAt())  // 부모-아이 관계 등록 시간 사용
                            .bankName(bankName)
                            .accountNumber(accountNumber)
                            .build();
                })
                // 생일 기준 정렬 (오름차순)
                .sorted(Comparator.comparing(ChildResponse::getUserBirth))
                .collect(Collectors.toList());
    }
    
    public ChildrenDetailResponse getChildRegularTransferDetail(Integer parentId, Integer childId) {
        // 부모-자식 관계 확인 (없으면 예외 발생)
        ParentChild parentChild = parentChildRepository.findByParentUserIdAndChildUserId(parentId, childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
        User child = parentChild.getChild();
        Integer creditScore = (child.getCreditScore() != null) ? child.getCreditScore().getScore() : null;

        // 대출 잔액 합계 계산
        List<Loan> loans = loanRepository.findByParentChild(parentChild);
        Long totalLoanAmount = loans.stream()
                .mapToLong(loan -> loan.getLastAmount() != null ? loan.getLastAmount() : 0L)
                .sum();

        // 정기 송금 내역 조회 (없으면 null로 처리)
        Optional<ScheduledTransfer> scheduledTransferOpt = scheduledTransferRepository.findByParentChild(parentChild);
        RegularTransferResponse regularTransfer = null;
        if (scheduledTransferOpt.isPresent()) {
            ScheduledTransfer scheduledTransfer = scheduledTransferOpt.get();
            String scheduledFrequency = scheduledTransfer.getTransferCycle().toString().toLowerCase();
            Integer startDate;
            if (scheduledTransfer.getTransferCycle() == TransferCycle.WEEKLY) {
                startDate = convertWeekdayToInt(scheduledTransfer.getTransferWeekday());
            } else if (scheduledTransfer.getTransferCycle() == TransferCycle.MONTHLY) {
                startDate = scheduledTransfer.getTransferDay();
            } else {
                startDate = 0; // 예: DAILY 등 처리
            }
            regularTransfer = RegularTransferResponse.builder()
                    .scheduledAmount(scheduledTransfer.getTransferAmount())
                    .scheduledFrequency(scheduledFrequency)
                    .startDate(startDate)
                    .build();
        }

        // 자녀의 계좌 정보 조회 (account 테이블에서 user_id를 통해)
        Account childAccount = accountRepository.findByUser(child).orElse(null);
        String childAccountNum = null;
        Integer bankNum = null;
        if (childAccount != null) {
            childAccountNum = childAccount.getAccountNumber();
            if (childAccount.getBank() != null) {
                bankNum = childAccount.getBank().getBankId();
            }
        }

        return ChildrenDetailResponse.builder()
                .childId(child.getUserId())
                .childName(child.getUserName())
                .childGender(child.getUserGender().toString())
                .childAccountNum(childAccountNum)
                .bankNum(bankNum)
                .creditScore(creditScore)
                .loanAmount(totalLoanAmount)
                .regularTransfer(regularTransfer)
                .build();
    }

    public ChildrenDetailResponse createChildRegularTransfer(Integer parentId, Integer childId, RegularTransferResponse updateRequest) {
        // 부모-자식 관계 확인 (없으면 예외 발생)
        ParentChild parentChild = parentChildRepository.findByParentUserIdAndChildUserId(parentId, childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 이미 정기 송금 내역이 존재하는 경우 예외 발생 (또는 상황에 따라 업데이트로 처리)
        Optional<ScheduledTransfer> existingTransfer = scheduledTransferRepository.findByParentChild(parentChild);
        if (existingTransfer.isPresent()) {
            throw new ResourceAlreadyExistsException("정기 용돈 송금 내역이 이미 존재합니다.");
        }

        // ScheduledTransfer 객체를 빌더를 사용하여 생성 (필수 필드들 설정)
        ScheduledTransfer scheduledTransfer = ScheduledTransfer.builder()
                .user(parentChild.getParent()) // scheduled_transfer.user는 부모 사용자로 설정
                .parentChild(parentChild)
                .transferAmount(updateRequest.getScheduledAmount())
                .startDate(LocalDate.now())  // 시작일은 현재 날짜(또는 필요한 값)로 설정
                .status(TransferStatus.ACTIVE)
                .build();

        // 요청의 주기에 따라 transferCycle 및 시작일(요일 또는 일자) 설정
        String frequency = updateRequest.getScheduledFrequency();
        if ("weekly".equalsIgnoreCase(frequency)) {
            scheduledTransfer.setTransferCycle(TransferCycle.WEEKLY);
            scheduledTransfer.setTransferWeekday(convertIntToWeekday(updateRequest.getStartDate()));
            scheduledTransfer.setTransferDay(null); // 주간이면 월별 값은 null
        } else if ("monthly".equalsIgnoreCase(frequency)) {
            scheduledTransfer.setTransferCycle(TransferCycle.MONTHLY);
            scheduledTransfer.setTransferDay(updateRequest.getStartDate());
            scheduledTransfer.setTransferWeekday(null);
        }
        // 생성된 정기 송금 내역 저장
        scheduledTransferRepository.save(scheduledTransfer);

        // 생성된 내역을 포함하여 ChildrenDetailResponse를 반환 (이미 구현된 메서드 재사용)
        return getChildRegularTransferDetail(parentId, childId);
    }


    // 정기 송금 내역 업데이트 메서드 추가
    public ChildrenDetailResponse updateChildRegularTransfer(Integer parentId, Integer childId, RegularTransferResponse updateRequest) {
        // 부모-자식 관계 확인 (없으면 예외 발생)
        ParentChild parentChild = parentChildRepository.findByParentUserIdAndChildUserId(parentId, childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
        // 정기 송금 내역 조회 (없으면 예외 발생)
        ScheduledTransfer scheduledTransfer = scheduledTransferRepository.findByParentChild(parentChild)
                .orElseThrow(() -> new ResourceNotFoundException("해당 부모의 정기 용돈 송금 내역이 없습니다."));

        // 정기 송금 금액 업데이트
        scheduledTransfer.setTransferAmount(updateRequest.getScheduledAmount());

        // 주기별로 시작일 설정
        String frequency = updateRequest.getScheduledFrequency();
        if ("weekly".equalsIgnoreCase(frequency)) {
            scheduledTransfer.setTransferCycle(TransferCycle.WEEKLY);
            scheduledTransfer.setTransferWeekday(convertIntToWeekday(updateRequest.getStartDate()));
            scheduledTransfer.setTransferDay(null); // monthly 값이 있을 경우 초기화
        } else if ("monthly".equalsIgnoreCase(frequency)) {
            scheduledTransfer.setTransferCycle(TransferCycle.MONTHLY);
            scheduledTransfer.setTransferDay(updateRequest.getStartDate());
            scheduledTransfer.setTransferWeekday(null);
        }

        // 업데이트 반영
        scheduledTransferRepository.save(scheduledTransfer);

        // 업데이트된 정보를 다시 조회해서 ChildrenDetailResponse로 반환 (이미 구현된 메서드 재사용)
        return getChildRegularTransferDetail(parentId, childId);
    }

    @Transactional
    public void cancelChildRegularTransfer(Integer parentId, Integer childId) {
        // 부모–자식 관계 확인
        ParentChild parentChild = parentChildRepository
                .findByParentUserIdAndChildUserId(parentId, childId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 정기 송금 내역 조회
        Optional<ScheduledTransfer> scheduledTransferOpt = scheduledTransferRepository.findByParentChild(parentChild);
        if (scheduledTransferOpt.isPresent()) {
            ScheduledTransfer scheduledTransfer = scheduledTransferOpt.get();
            // 활성 상태 여부 확인(선택사항)
            scheduledTransferRepository.delete(scheduledTransfer);
        }
        else {
            throw new ResourceNotFoundException("해당 부모의 정기 용돈 송금 내역이 없습니다.");
        }
    }


    // 헬퍼: 요일(enum)을 정수로 변환 (MON=1, TUE=2, …)
    private int convertWeekdayToInt(TransferWeekday weekday) {
        switch (weekday) {
            case MON: return 1;
            case TUE: return 2;
            case WED: return 3;
            case THU: return 4;
            case FRI: return 5;
            case SAT: return 6;
            case SUN: return 7;
            default: return 0;
        }
    }

    // 헬퍼: 정수(요일)를 TransferWeekday로 변환 (1: MON, 2: TUE, ... 7: SUN)
    private TransferWeekday convertIntToWeekday(Integer day) {
        if(day == null) {
            throw new IllegalArgumentException("요일 값이 null입니다.");
        }
        switch(day) {
            case 1: return TransferWeekday.MON;
            case 2: return TransferWeekday.TUE;
            case 3: return TransferWeekday.WED;
            case 4: return TransferWeekday.THU;
            case 5: return TransferWeekday.FRI;
            case 6: return TransferWeekday.SAT;
            case 7: return TransferWeekday.SUN;
            default: throw new IllegalArgumentException("잘못된 요일 값: " + day);
        }
    }
}