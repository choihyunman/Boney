INSERT INTO user (
  user_email, user_birth, user_phone, user_name,
  role, kakao_id, user_gender, created_at
) VALUES (
  'child01@example.com', '2012-01-10', '010-2000-0001', '김서준',
  'CHILD', 2000000000001, 'MALE', NOW()
);