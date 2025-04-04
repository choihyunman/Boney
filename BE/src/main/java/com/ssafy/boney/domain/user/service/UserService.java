package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.account.entity.Account;
import com.ssafy.boney.domain.account.repository.AccountRepository;
import com.ssafy.boney.domain.loan.repository.LoanRepaymentRepository;
import com.ssafy.boney.domain.loan.repository.LoanRepository;
import com.ssafy.boney.domain.loan.repository.LoanSignatureRepository;
import com.ssafy.boney.domain.notification.repository.NotificationRepository;
import com.ssafy.boney.domain.quest.repository.QuestRepository;
import com.ssafy.boney.domain.report.repository.MonthlyReportRepository;
import com.ssafy.boney.domain.scheduledTransfer.repository.ScheduledTransferRepository;
import com.ssafy.boney.domain.transaction.entity.Transaction;
import com.ssafy.boney.domain.transaction.repository.FdsRepository;
import com.ssafy.boney.domain.transaction.repository.TransactionHashtagRepository;
import com.ssafy.boney.domain.transaction.repository.TransactionRepository;
import com.ssafy.boney.domain.transaction.repository.TransferRepository;
import com.ssafy.boney.domain.user.dto.UserSignupRequest;
import com.ssafy.boney.domain.user.entity.CreditScore;
import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssafy.boney.domain.user.entity.enums.Role;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    @Value("${kakao.admin-key}")
    private String kakaoAdminKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransferRepository transferRepository;
    private final FdsRepository fdsRepository;
    private final TransactionHashtagRepository transactionHashtagRepository;
    private final ScheduledTransferRepository scheduledTransferRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final LoanSignatureRepository loanSignatureRepository;
    private final LoanRepository loanRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    private final QuestRepository questRepository; // DI 필요

    @Autowired
    private final ParentChildRepository parentChildRepository;

    @Autowired
    private final MonthlyReportRepository monthlyReportRepository;

    public Optional<User> findByKakaoId(Long kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }

    @Transactional(readOnly = true)
    public User findById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> registerUser(UserSignupRequest request) {
        // 이메일 중복 체크
        if (userRepository.findByUserEmail(request.getUserEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", 400,
                            "message", "이미 존재하는 이메일입니다."
                    ));
        }

        // 카카오 ID 중복 체크
        if (userRepository.findByKakaoId(request.getKakaoId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", 400,
                            "message", "이미 존재하는 카카오 ID입니다."
                    ));
        }

        // 사용자 생성 (Builder 패턴 사용)
        User newUser = User.builder()
                .userEmail(request.getUserEmail())
                .userBirth(request.getUserBirth())
                .userPhone(request.getUserPhone())
                .userName(request.getUserName())
                .role(request.getRole())
                .kakaoId(request.getKakaoId())
                .userGender(request.getUserGender())
                .createdAt(LocalDateTime.now()) // 회원가입 시간 설정
                .build();

        // 사용자가 CHILD일 경우, CreditScore Entity에 데이터 추가
        if (newUser.getRole() == Role.CHILD) {
            CreditScore creditScore = CreditScore.builder()
                    .user(newUser)
                    .score(50)
                    .updatedAt(LocalDateTime.now())
                    .build();
            newUser.setCreditScore(creditScore);
        }

        User savedUser = userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "status", 201,
                        "message", "회원가입이 완료되었습니다.",
                        "data", Map.of(
                                "userId", savedUser.getUserId(),
                                "userName", savedUser.getUserName(),
                                "role", savedUser.getRole().toString(),
                                "userEmail", savedUser.getUserEmail(),
                                "kakaoId", savedUser.getKakaoId()
                        )
                ));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> deleteUserByKakaoId(Long kakaoId) {
        Optional<User> userOpt = userRepository.findByKakaoId(kakaoId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", 404,
                    "message", "회원 정보를 찾을 수 없습니다."
            ));
        }

        User user = userOpt.get();

        // 1. 카카오 연결 끊기 시도
        try {
            String unlinkUrl = "https://kapi.kakao.com/v1/user/unlink";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "KakaoAK " + kakaoAdminKey);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("target_id_type", "user_id");
            body.add("target_id", String.valueOf(kakaoId));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(unlinkUrl, request, String.class);
        } catch (Exception e) {
            // 카카오 연결 끊기에 실패해도 로컬 DB 삭제는 계속 진행
            System.out.println("카카오 연결 끊기 실패: " + e.getMessage());
        }
        monthlyReportRepository.deleteAllByChild(user);
        notificationRepository.deleteAllByUser(user);
        // 2. parent_child 기반으로 연관된 quest, scheduled_transfer 삭제
        List<ParentChild> relations = user.getParents();  // 자녀인 경우
        relations.addAll(user.getChildren());             // 부모인 경우

        for (ParentChild relation : relations) {
            // 퀘스트
            questRepository.deleteAllByParentChild(relation);
            // 정기이체
            scheduledTransferRepository.deleteAllByParentChild(relation);
            // 대출 상환
            loanRepaymentRepository.deleteAllByLoan_ParentChild(relation);
            // 전자 서명
            loanSignatureRepository.deleteAllByLoan_ParentChild(relation);
            // 대출
            loanRepository.deleteAllByParentChild(relation);
        }

        // parent_child 삭제
        parentChildRepository.deleteAll(relations);

        // 3. 계좌별 거래 관련 정보 삭제
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            List<Transaction> transactions = transactionRepository.findByAccount(account);

            for (Transaction tx : transactions) {
                transactionHashtagRepository.deleteAllByTransaction(tx);
                fdsRepository.deleteAllByTransaction(tx);
                transferRepository.deleteAllByTransaction(tx);
            }

            transactionRepository.deleteAll(transactions);
            transferRepository.deleteAllByAccount(account);
            fdsRepository.deleteAllByAccount(account);
        }

        accountRepository.deleteAll(accounts);

        // 4. 사용자 삭제 (credit_score, favorites, fcm_token 등은 cascade = ALL)
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "회원 탈퇴 및 카카오 연결 해제가 완료되었습니다."
        ));
    }

}
