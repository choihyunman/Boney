CREATE DATABASE IF NOT EXISTS boney CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE boney;

CREATE DATABASE boney_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
  36,
  '2025-02-01',
  60000,
  30000,
  '[
    {
      "category": "식사",
      "amount": 15000,
      "percentage": 50,
      "transactions": [
        {
          "transactionId": 101,
          "amount": 5000,
          "createdAt": "2025-02-05T10:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "김밥천국"
        },
        {
          "transactionId": 102,
          "amount": 10000,
          "createdAt": "2025-02-12T13:20:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "학교매점"
        }
      ]
    },
    {
      "category": "문구",
      "amount": 15000,
      "percentage": 50,
      "transactions": [
        {
          "transactionId": 103,
          "amount": 15000,
          "createdAt": "2025-02-20T11:00:00",
          "transactionType": "WITHDRAWAL",
          "transactionContent": "다이소"
        }
      ]
    }
  ]',
  3,
  10000,
  67,
  33
);
