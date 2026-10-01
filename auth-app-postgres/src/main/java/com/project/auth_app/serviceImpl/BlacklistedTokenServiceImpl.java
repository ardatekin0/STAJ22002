package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.BlacklistedToken;
import com.project.auth_app.repository.BlacklistedTokenRepository;
import com.project.auth_app.service.BlacklistedTokenService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class BlacklistedTokenServiceImpl implements BlacklistedTokenService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public BlacklistedTokenServiceImpl(BlacklistedTokenRepository blacklistedTokenRepository) {
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }


    @Override
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    @Override
    public void blacklistToken(String token, Date expirationDate) {

        if(token==null || expirationDate==null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Token veya expiration date bilgisi eksik!");
        }

        if (!blacklistedTokenRepository.existsByToken(token) && expirationDate.after(new Date())) {

            blacklistedTokenRepository.save(new BlacklistedToken(token, expirationDate));
        }
    }

    @Override
    public List<BlacklistedToken> getBlacklistedTokens(){
        return  blacklistedTokenRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteToken(String token) {
        blacklistedTokenRepository.deleteByToken(token);
    }

    @Override
    public List<BlacklistedToken> findByExpirationDateBefore(Date date) {
        return blacklistedTokenRepository.findByExpirationDateBefore(date);
    }

}
