package com.ssafy.boney.domain.user;

import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlGroup;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Rollback
@SqlGroup({
    @Sql(scripts = "classpath:/sql/truncate-all.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD),
    @Sql(scripts = "classpath:/sql/test-init.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void 카카오ID로_회원조회_성공() {
        // given
        Long kakaoId = 2000000000001L;

        // when
        Optional<User> userOpt = userRepository.findByKakaoId(kakaoId);

        // then
        assertTrue(userOpt.isPresent());
        assertEquals("김서준", userOpt.get().getUserName());
    }
}