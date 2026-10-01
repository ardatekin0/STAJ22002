package com.project.auth_app.repository;

import com.project.auth_app.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;


@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, String> {

    boolean existsByToken(String token);
    void deleteByToken(String token);
    List<BlacklistedToken> findByExpirationDateBefore(Date date);

}