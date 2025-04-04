package com.ssafy.boney.domain.scheduledTransfer;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.scheduledTransfer.entity.ScheduledTransfer;
import com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferCycle;
import com.ssafy.boney.domain.scheduledTransfer.entity.enums.TransferWeekday;
import com.ssafy.boney.domain.scheduledTransfer.repository.ScheduledTransferRepository;
import com.ssafy.boney.domain.transaction.service.TransferService;
import com.ssafy.boney.domain.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTransferScheduler {

    private final ScheduledTransferRepository scheduledTransferRepository;
    private final AccountRepository accountRepository;
    private final TransferService transferService;

    // 매일 12시에 실행
    @Scheduled(cron = "0 0 12 * * ?")
//    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void executeScheduledTransfers() {
        LocalDate today = LocalDate.now();
        // 오늘 실행 가능한 모든 ScheduledTransfer 조회
        List<ScheduledTransfer> transfers = scheduledTransferRepository.findAllActive(today);

        for (ScheduledTransfer st : transfers) {
            if (isDueToday(st, today)) {
                try {
                    executeTransfer(st);
                    log.info("정기 송금 성공: ScheduledTransferId = {}", st.getScheduledTransferId());
                } catch (Exception e) {
                    log.error("정기 송금 실패: ScheduledTransferId = {}, error={}", st.getScheduledTransferId(), e.getMessage());
                    // 실패 건에 대해 재시도 로직이나 알림 처리 가능
                }
            }
        }
    }

    // 해당 ScheduledTransfer가 오늘 실행 대상인지 확인
    private boolean isDueToday(ScheduledTransfer st, LocalDate today) {
        TransferCycle cycle = st.getTransferCycle();
        switch (cycle) {
            case WEEKLY:
                int todayWeekday = today.getDayOfWeek().getValue();
                return st.getTransferWeekday() != null && convertWeekdayToInt(st.getTransferWeekday()) == todayWeekday;
            case MONTHLY:
                return st.getTransferDay() != null && today.getDayOfMonth() == st.getTransferDay();
            default:
                return false;
        }
    }

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

    // 실제 송금 실행 로직
    private void executeTransfer(ScheduledTransfer st) {
        // 부모(송금자) 계좌 조회
        User parent = st.getUser();
        Account parentAccount = accountRepository.findByUser(parent)
                .orElseThrow(() -> new RuntimeException("부모 계좌가 존재하지 않습니다."));

        // 자식(수취자) 계좌 조회
        User child = st.getParentChild().getChild();
        Account childAccount = accountRepository.findByUser(child)
                .orElseThrow(() -> new RuntimeException("자식 계좌가 존재하지 않습니다."));

        String summary = "정기 용돈 송금 " + parent.getUserName() + " -> " + child.getUserName();

        // TransferService의 자동 송금 메서드 호출
        transferService.processParentChildTransferAuto(parent, parentAccount, child, childAccount, st.getTransferAmount(), summary);
    }
}
