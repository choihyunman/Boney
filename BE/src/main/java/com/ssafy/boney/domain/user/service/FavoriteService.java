package com.ssafy.boney.domain.user.service;


import com.ssafy.boney.domain.account.entity.Bank;
import com.ssafy.boney.domain.account.repository.BankRepository;
import com.ssafy.boney.domain.account.service.BankingApiService;
import com.ssafy.boney.domain.user.dto.FavoriteResponse;
import com.ssafy.boney.domain.user.entity.Favorite;
import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.exception.UserConflictException;
import com.ssafy.boney.domain.user.exception.UserErrorCode;
import com.ssafy.boney.domain.user.exception.UserNotFoundException;
import com.ssafy.boney.domain.user.repository.FavoriteRepository;
import com.ssafy.boney.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final BankRepository bankRepository;
    private final BankingApiService bankingApiService;

    // 계좌 즐겨찾기 등록
    @Transactional
    public FavoriteResponse registerFavorite(Integer userId, String bankName, String favoriteAccount) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 중복 체크 : 이미 즐겨찾기로 등록된 계좌인지 확인
        if (favoriteRepository.findByUserAndFavoriteAccount(user, favoriteAccount).isPresent()) {
            throw new UserConflictException(UserErrorCode.FAVORITE_CONFLICT);
        }

        // 유효성 검증: SSAFY API를 통해 해당 계좌의 예금주 정보를 조회
        String accountHolderName;
        try {
            accountHolderName = bankingApiService.getAccountHolderName(favoriteAccount);
        } catch (RuntimeException e) {
            throw new UserConflictException(UserErrorCode.INVALID_ACCOUNT);
        }
        if (accountHolderName == null || accountHolderName.isEmpty()) {
            throw new UserConflictException(UserErrorCode.INVALID_ACCOUNT);
        }

        // Bank 엔티티 조회
        Bank bank = bankRepository.findByBankName(bankName)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        Favorite favorite = Favorite.builder()
                .user(user)
                .favoriteAccount(favoriteAccount)
                .bank(bank)
                .accountHolder(accountHolderName)
                .createdAt(LocalDateTime.now())
                .build();

        Favorite savedFavorite = favoriteRepository.save(favorite);

        return FavoriteResponse.builder()
                .favoriteId(savedFavorite.getFavoriteId())
                .bankId(bank.getBankId())
                .bankName(bank.getBankName())
                .accountHolder(savedFavorite.getAccountHolder())
                .favoriteAccount(savedFavorite.getFavoriteAccount())
                .createdAt(savedFavorite.getCreatedAt())
                .build();
    }


    // 계좌 즐겨찾기 조회
    public List<FavoriteResponse> getFavoriteList(Integer userId) {
        // 사용자 조회
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        // 즐겨찾기 목록 조회
        List<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(userRepository.findById(userId).get());

        // SSAFY API를 통해 계좌 유효성 확인
        return favorites.stream()
                .map(fav -> {
                    String accountHolder = fav.getAccountHolder();
                    if (accountHolder == null || accountHolder.isEmpty()) {
                        return null;
                    }
                    return FavoriteResponse.builder()
                            .favoriteId(fav.getFavoriteId())
                            .bankId(fav.getBank().getBankId())
                            .bankName(fav.getBank().getBankName())
                            .accountHolder(accountHolder)
                            .favoriteAccount(fav.getFavoriteAccount())
                            .createdAt(fav.getCreatedAt())
                            .build();
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    // 계좌 즐겨찾기 삭제
    @Transactional
    public FavoriteResponse deleteFavorite(Integer userId, Integer favoriteId) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        Favorite favorite = favoriteRepository.findByFavoriteIdAndUser(favoriteId, user)
                .orElseThrow(() -> new UserNotFoundException(UserErrorCode.NOT_FOUND));

        FavoriteResponse responseDto = FavoriteResponse.builder()
                .favoriteId(favorite.getFavoriteId())
                .bankId(favorite.getBank().getBankId())
                .bankName(favorite.getBank().getBankName())
                .accountHolder(favorite.getAccountHolder())
                .favoriteAccount(favorite.getFavoriteAccount())
                .createdAt(favorite.getCreatedAt())
                .build();

        // 즐겨찾기 삭제
        favoriteRepository.delete(favorite);

        return responseDto;
    }

}