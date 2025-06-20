package com.ssafy.boney.domain.user.repository;

import com.ssafy.boney.domain.user.entity.Favorite;
import com.ssafy.boney.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    Optional<Favorite> findByUserAndFavoriteAccount(User user, String favoriteAccount);
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    Optional<Favorite> findByFavoriteIdAndUser(Integer favoriteId, User user);
}
