package com.project.auth_app.service;

import com.project.auth_app.model.BlacklistedToken;

import java.util.Date;
import java.util.List;

public interface BlacklistedTokenService {

    boolean isTokenBlacklisted(String token);
    void blacklistToken(String token, Date expirationDate);
    List<BlacklistedToken> getBlacklistedTokens();
    void deleteToken(String token);
    List<BlacklistedToken> findByExpirationDateBefore(Date date);

}
