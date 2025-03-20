package com.ssafy.boney.domain.user.repository;

import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // 이메일로 사용자 검색
    Optional<User> findByUserEmail(String userEmail);

    // 카카오 ID로 사용자 검색
    Optional<User> findByKakaoId(Long kakaoId);

    // 전화번호로 사용자 검색
    Optional<User> findByUserPhone(String userPhone);

    // 이메일 + 전화번호로 사용자 검색
    Optional<User> findByUserEmailAndUserPhone(String userEmail, String userPhone);


}
