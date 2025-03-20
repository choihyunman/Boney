package com.ssafy.boney.domain.user.service;

import com.ssafy.boney.domain.user.entity.ParentChild;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.ParentChildRepository;
import com.ssafy.boney.domain.user.exception.UserConflictException;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ParentChildService {

    private final UserRepository userRepository;
    private final ParentChildRepository parentChildRepository;

    // 아이 등록
    public void registerChild(Integer parentId, String childEmail, String childPhone) {
        // 보호자 조회
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));
        // 이메일 + 휴대폰 일치하는 아이 조회
        Optional<User> childOpt = userRepository.findByUserEmailAndUserPhone(childEmail, childPhone);
        if (!childOpt.isPresent()) {
            throw new UserNotFoundException(UserErrorCode.NOT_FOUND);
        }
        User child = childOpt.get();
        // 이미 등록된 보호자-아이 관계인지 확인
        if (parentChildRepository.existsByParentAndChild(parent, child)) {
            throw new UserConflictException(UserErrorCode.CONFLICT);
        }
        // 보호자-아이 관계 생성
        ParentChild parentChild = ParentChild.builder()
                .parent(parent)
                .child(child)
                .createdAt(LocalDateTime.now())
                .build();
        parentChildRepository.save(parentChild);
    }


}
