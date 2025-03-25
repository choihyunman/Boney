CREATE DATABASE IF NOT EXISTS boney CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boney;

-- (B) Bank 테이블
INSERT INTO bank (bank_id, bank_name)
VALUES (1, '테스트은행');

-- (C) Account 테이블
INSERT INTO account (bank_id, user_id, account_number, account_password, account_balance, created_at) 
VALUES (
  1,   -- bank_id=1
  14,   -- user_id=1
  '001439345124956',
  'testpw',
  500000,
  NOW()
);

INSERT INTO transaction_category (
  transaction_category_id,
  transaction_category_name,
  is_custom,
  created_at
) VALUES
(1, '입금', false, NOW()),
(2, '출금', false, NOW()),
(3, '기타', false, NOW()),
(4, '커피', false, NOW()),
(5, '잡화', false, NOW());


-- (B) Transaction_Content
INSERT INTO transaction_content (
  content_name,
  default_transaction_category_id
) VALUES
('입금', 1),
('출금', 2),
('기타', 3),
('스타벅스', 4),
('다이소', 5);

INSERT INTO transaction (
  account_id,
  user_id,
  transaction_content_id,
  transaction_category_id,
  transaction_type,
  transaction_amount,
  created_at,
  external_transaction_no,
  transaction_after_balance
) VALUES (
  7,   -- account_id=1
  14,   -- user_id=1
  5,   -- transaction_content_id=2 (ex: '스타벅스')
  5,   -- transaction_category_id=4 (ex: '식비')
  'WITHDRAWAL',
  15000,
  '2025-03-24 02:00:00',
  10001,
  485000  -- 거래 후 잔액 (500000 - 15000)
);

INSERT INTO account (
  bank_id,
  user_id,
  account_number,
  account_password,
  account_balance,
  created_at
) VALUES (               -- 새 account_id
  1,               -- 기존 테스트은행
  14,               -- user_id = 5
  '555555555555555',
  'user5pw',
  300000,
  NOW()
);

-- (D) Transaction 내역
INSERT INTO transaction (
  account_id,
  user_id,
  transaction_content_id,
  transaction_category_id,
  transaction_type,
  transaction_amount,
  created_at,
  external_transaction_no,
  transaction_after_balance
) VALUES (
  6,
  14,
  4,
  4,
  'WITHDRAWAL',
  4800,
  '2025-03-24 10:00:00',
  10002,
  295200
);