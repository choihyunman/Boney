package com.ssafy.boney.domain.transaction.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnomalyRequestDto {
    private Integer transferId;
    private String senderAccount;
    private String recipientAccount;
    // 거래 금액: 이체되는 금액 (보통 단위는 원, 달러 등)
    private Long amount;
    // 거래 생성 시간: 거래가 발생한 날짜와 시간
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    // 평균 거래 금액: 특정 기간 혹은 계좌의 거래 평균 금액
    private Double averageTransactionAmount;
    // 거래 금액의 표준편차: 거래 금액 분포의 변동성을 나타내는 값
    private Double stdDevTransactionAmount;
    // 금액 비율: 현재 거래 금액이 평균 거래 금액에 비해 어느 정도인지 나타내는 비율
    private Double amountRatio;
    // 최근 10분간 거래 횟수: 지난 10분 동안 발생한 거래의 건수
    private Integer transactionCountLast10Minutes;
    // 최근 1시간 거래 횟수: 지난 1시간 동안 발생한 거래의 건수
    private Integer transactionCountLastHour;
    // 거래 간 시간 간격: 이전 거래와의 시간 차이를 분 단위로 표시
    private Long timeGapMinutes;
    // 신규 수신자 플래그: 해당 수신자가 처음 거래 대상인지 여부 (true: 신규, false: 기존)
    private Boolean newRecipientFlag;
    // 거래 발생 시각(시간): 거래가 이루어진 시간(시각 정보)
    private Integer transactionHour;
    // 거래 유형
    private String transactionCategory;
}