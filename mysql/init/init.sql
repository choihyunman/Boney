CREATE DATABASE IF NOT EXISTS boney CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boney;

-- 1️⃣ User
INSERT INTO `user` (user_id, user_email, user_birth, user_phone, user_name, role, created_at, kakao_id, user_gender)
VALUES (1, 'test@example.com', '2000-01-01', '01012345678', '테스트유저', 'CHILD', NOW(), 123456789, 'MALE');

-- 2️⃣ Bank (참조 무결성 위해)
INSERT INTO bank (bank_id, bank_name) VALUES (1, 'Test Bank2');

-- 3️⃣ Account
INSERT INTO account (account_id, bank_id, user_id, account_number, account_password, account_balance, created_at)
VALUES (1, 1, 1, '123-456-789', 'pwd', 1000000, NOW());

-- 4️⃣ Transaction_Category
INSERT INTO transaction_category (transaction_category_id, transaction_category_name, is_custom, created_at)
VALUES (1, '식비', FALSE, NOW()), (2, '용돈', FALSE, NOW());

-- 5️⃣ Transaction
INSERT INTO `transaction` (transaction_id, account_id, user_id, transaction_category_id, transaction_type, transaction_amount, created_at, transaction_content, external_transaction_no)
VALUES 
(1, 1, 1, 2, 'DEPOSIT', 10000, '2025-03-11 02:32:00', '정기 용돈', '1'),
(2, 1, 1, 1, 'WITHDRAWAL', -10000, '2025-03-13 13:11:00', '현만분식', '2');

-- 6️⃣ Hashtag
INSERT INTO hashtag (hashtag_id, name, created_at)
VALUES (1, '떡볶이', NOW()), (2, '튀김', NOW());

-- 7️⃣ Transaction_Hashtag
INSERT INTO transaction_hashtag (transaction_hashtag_id, hashtag_id, transaction_id)
VALUES (1, 1, 1), (2, 2, 2);
