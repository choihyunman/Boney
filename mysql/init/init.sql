CREATE DATABASE IF NOT EXISTS boney CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE boney;

CREATE DATABASE boney_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- (B) Bank 테이블
INSERT INTO bank (bank_name)
VALUES ('버니은행');

INSERT INTO `transaction_category` VALUES 
  (1,'2025-03-23 16:49:27', 0, '입금'),
  (2,'2025-03-23 16:49:27', 0, '출금'),
  (3,'2025-03-23 16:49:27', 0, '용돈'),
  (4,'2025-03-23 16:49:27', 0, '대출'),
  (5,'2025-03-25 00:22:13', 0, '퀘스트'),
  (6,'2025-03-25 00:22:13', 0, '이체'),
  (7,'2025-03-25 00:22:13', 0, '대출상환'),
  (8,'2025-03-25 00:22:13', 0, '식사'),
  (9,'2025-03-25 00:22:13', 0, '교통비'),
  (10,'2025-03-25 00:22:13', 0, '학습'),
  (11,'2025-03-25 00:22:13', 0, '문구'),
  (12,'2025-03-25 00:22:13', 0, '문화'),
  (13,'2025-03-25 00:22:13', 0, '카페/간식'),
  (14,'2025-03-25 00:22:13', 0, '의류/미용'),
  (15,'2025-03-25 00:22:13', 0, '의료'),
  (16,'2025-03-25 00:22:13', 0, '생활/잡화'),
  (17,'2025-03-23 16:49:27', 0, '기타');

-- (B) Transaction_Content
INSERT INTO `transaction_content` VALUES 
  (1,'입금','2025-03-23 16:51:23',1),
  (2,'출금','2025-03-23 16:51:23',2),
  (3,'기타','2025-03-23 16:51:23',17),
  (4,'이체','2025-03-25 00:22:13',6),
  (5,'스타벅스','2025-03-23 16:51:23',13),
  (6,'다이소','2025-03-23 16:51:23',16);

  -- 2025년 2월 거래 (10건)
INSERT INTO `transaction` 
(account_id, user_id, transaction_content_id, transaction_category_id, transaction_type, transaction_amount, created_at, external_transaction_no, transaction_after_balance)
VALUES
(3, 3, 1, 1, 'DEPOSIT', 5000, '2025-02-02 10:00:00', 100001, 10000),
(3, 3, 2, 2, 'WITHDRAWAL', 2000, '2025-02-04 12:30:00', 100002, 8000),
(3, 3, 5, 13, 'WITHDRAWAL', 4500, '2025-02-06 14:20:00', 100003, 3500),
(3, 3, 6, 16, 'WITHDRAWAL', 3000, '2025-02-08 09:00:00', 100004, 500),
(3, 3, 1, 1, 'DEPOSIT', 7000, '2025-02-10 16:45:00', 100005, 7500),
(3, 3, 2, 2, 'WITHDRAWAL', 1500, '2025-02-12 11:00:00', 100006, 6000),
(3, 3, 1, 1, 'DEPOSIT', 10000, '2025-02-15 13:00:00', 100007, 16000),
(3, 3, 5, 13, 'WITHDRAWAL', 3500, '2025-02-18 15:00:00', 100008, 12500),
(3, 3, 2, 2, 'WITHDRAWAL', 5000, '2025-02-20 10:30:00', 100009, 7500),
(3, 3, 1, 1, 'DEPOSIT', 2500, '2025-02-25 18:00:00', 100010, 10000);

-- 2025년 3월 거래 (10건)
INSERT INTO `transaction` 
(account_id, user_id, transaction_content_id, transaction_category_id, transaction_type, transaction_amount, created_at, external_transaction_no, transaction_after_balance)
VALUES
(3, 3, 1, 1, 'DEPOSIT', 5000, '2025-03-02 09:00:00', 100011, 15000),
(3, 3, 6, 16, 'WITHDRAWAL', 2000, '2025-03-03 14:30:00', 100012, 13000),
(3, 3, 2, 2, 'WITHDRAWAL', 1500, '2025-03-05 17:00:00', 100013, 11500),
(3, 3, 1, 1, 'DEPOSIT', 8000, '2025-03-07 12:00:00', 100014, 19500),
(3, 3, 5, 13, 'WITHDRAWAL', 3000, '2025-03-10 08:30:00', 100015, 16500),
(3, 3, 6, 16, 'WITHDRAWAL', 2500, '2025-03-12 11:15:00', 100016, 14000),
(3, 3, 1, 1, 'DEPOSIT', 9000, '2025-03-16 13:00:00', 100017, 23000),
(3, 3, 2, 2, 'WITHDRAWAL', 4000, '2025-03-18 10:30:00', 100018, 19000),
(3, 3, 6, 16, 'WITHDRAWAL', 3500, '2025-03-21 15:45:00', 100019, 15500),
(3, 3, 1, 1, 'DEPOSIT', 5000, '2025-03-25 17:30:00', 100020, 20500);

-- 2025년 4월 2일 거래 (10건)
INSERT INTO `transaction` 
(account_id, user_id, transaction_content_id, transaction_category_id, transaction_type, transaction_amount, created_at, external_transaction_no, transaction_after_balance)
VALUES
(3, 3, 1, 1, 'DEPOSIT', 7000, '2025-04-02 08:00:00', 200001, 17000),
(3, 3, 5, 13, 'WITHDRAWAL', 3000, '2025-04-02 09:30:00', 200002, 14000),
(3, 3, 6, 16, 'WITHDRAWAL', 2500, '2025-04-02 10:15:00', 200003, 11500),
(3, 3, 2, 2, 'WITHDRAWAL', 1000, '2025-04-02 11:20:00', 200004, 10500),
(3, 3, 1, 1, 'DEPOSIT', 5000, '2025-04-02 13:00:00', 200005, 15500),
(3, 3, 2, 2, 'WITHDRAWAL', 2000, '2025-04-02 14:10:00', 200006, 13500),
(3, 3, 5, 13, 'WITHDRAWAL', 1500, '2025-04-02 15:30:00', 200007, 12000),
(3, 3, 6, 16, 'WITHDRAWAL', 1800, '2025-04-02 16:45:00', 200008, 10200),
(3, 3, 1, 1, 'DEPOSIT', 4000, '2025-04-02 17:50:00', 200009, 14200),
(3, 3, 5, 13, 'WITHDRAWAL', 2200, '2025-04-02 19:00:00', 200010, 12000);


-- -- INSERT 구문: quest_category 데이터
-- INSERT INTO quest_category (quest_category_id, category_name)
-- VALUES 
--   (1, '집안일'),
--   (2, '우리 가족'),
--   (3, '학습'),
--   (4, '생활습관'),
--   (5, '기타');

INSERT INTO monthly_report (
  child_id,
  report_month,
  total_income,
  total_expense,
  category_expense,
  quest_completed,
  quest_income,
  income_ratio,
  expense_ratio
) VALUES (
  3,
  '2025-02-01',
  60000,
  30000,
  '[
    {
      "category": "식사",
      "amount": 8000,
      "percentage": 26.7,
      "transactions": [
        {
          "transactionId": 301,
          "amount": 5000,
          "createdAt": "2025-02-04T12:10:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "학교 급식비"
        },
        {
          "transactionId": 302,
          "amount": 3000,
          "createdAt": "2025-02-10T13:45:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "분식집 김밥"
        }
      ]
    },
    {
      "category": "문구",
      "amount": 4000,
      "percentage": 13.3,
      "transactions": [
        {
          "transactionId": 303,
          "amount": 4000,
          "createdAt": "2025-02-15T11:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "문구점 색연필"
        }
      ]
    },
    {
      "category": "카페/간식",
      "amount": 5000,
      "percentage": 16.7,
      "transactions": [
        {
          "transactionId": 304,
          "amount": 2000,
          "createdAt": "2025-02-06T15:20:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "베스킨라빈스"
        },
        {
          "transactionId": 305,
          "amount": 3000,
          "createdAt": "2025-02-13T17:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "편의점 과자"
        }
      ]
    },
    {
      "category": "교통비",
      "amount": 3000,
      "percentage": 10.0,
      "transactions": [
        {
          "transactionId": 306,
          "amount": 3000,
          "createdAt": "2025-02-18T08:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "버스 교통카드 충전"
        }
      ]
    },
    {
      "category": "문화",
      "amount": 4000,
      "percentage": 13.3,
      "transactions": [
        {
          "transactionId": 307,
          "amount": 4000,
          "createdAt": "2025-02-22T14:30:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "영화관 관람"
        }
      ]
    },
    {
      "category": "생활/잡화",
      "amount": 6000,
      "percentage": 20.0,
      "transactions": [
        {
          "transactionId": 308,
          "amount": 6000,
          "createdAt": "2025-02-25T10:30:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "이마트 장보기"
        }
      ]
    }
  ]',
  4,
  15000,
  67,
  33
);

INSERT INTO monthly_report (
  child_id,
  report_month,
  total_income,
  total_expense,
  category_expense,
  quest_completed,
  quest_income,
  income_ratio,
  expense_ratio
) VALUES (
  3,
  '2025-03-01',
  70000,
  40000,
  '[
    {
      "category": "식사",
      "amount": 10000,
      "percentage": 25.0,
      "transactions": [
        {
          "transactionId": 401,
          "amount": 6000,
          "createdAt": "2025-03-03T12:30:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "도시락 카페"
        },
        {
          "transactionId": 402,
          "amount": 4000,
          "createdAt": "2025-03-09T13:10:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "편의점 샌드위치"
        }
      ]
    },
    {
      "category": "문구",
      "amount": 3000,
      "percentage": 7.5,
      "transactions": [
        {
          "transactionId": 403,
          "amount": 3000,
          "createdAt": "2025-03-11T10:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "지우개/노트 구매"
        }
      ]
    },
    {
      "category": "카페/간식",
      "amount": 8000,
      "percentage": 20.0,
      "transactions": [
        {
          "transactionId": 404,
          "amount": 3000,
          "createdAt": "2025-03-13T15:45:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "스타벅스"
        },
        {
          "transactionId": 405,
          "amount": 5000,
          "createdAt": "2025-03-16T16:20:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "편의점 아이스크림"
        }
      ]
    },
    {
      "category": "의류/미용",
      "amount": 5000,
      "percentage": 12.5,
      "transactions": [
        {
          "transactionId": 406,
          "amount": 5000,
          "createdAt": "2025-03-18T13:30:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "악세서리 구매"
        }
      ]
    },
    {
      "category": "문화",
      "amount": 7000,
      "percentage": 17.5,
      "transactions": [
        {
          "transactionId": 407,
          "amount": 7000,
          "createdAt": "2025-03-21T19:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "뮤지컬 관람"
        }
      ]
    },
    {
      "category": "생활/잡화",
      "amount": 7000,
      "percentage": 17.5,
      "transactions": [
        {
          "transactionId": 408,
          "amount": 7000,
          "createdAt": "2025-03-28T10:30:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "다이소 생필품"
        }
      ]
    }
  ]',
  5,
  12000,
  64,
  36
);
