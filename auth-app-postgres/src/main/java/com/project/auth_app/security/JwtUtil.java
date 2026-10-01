package com.project.auth_app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {


    private final SecretKey key;
    private final JwtParser parser;
    private long expirationMs;

    public JwtUtil(
            @Value("${security.jwt.secret-base64}") String secretBase64,
            @Value("${security.jwt.expiration-ms:10800000}") long expirationMs,
            @Value("${security.jwt.clock-skew-seconds:60}") long clockSkewSeconds) {
        byte[] keyBytes = Decoders.BASE64.decode(secretBase64);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret for HS256 must be at least 32 bytes.");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.parser = Jwts.parserBuilder()
                .setSigningKey(this.key)
                .setAllowedClockSkewSeconds(clockSkewSeconds)
                .build();
    }

    public String generateToken(String kullaniciAdi,String id ,List<String> roller) {

        return Jwts.builder()
                .setSubject(kullaniciAdi)
                .claim("id",id)
                .claim("roller", roller)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }


    public Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring(7);
    }


    public String getNameFromToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (token == null) {
            return null;
        }
        return getAllClaims(token).getSubject();
    }

    public List<String> getRolesFromToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (token == null) {
            return null;
        }
        return getAllClaims(token).get("roller", List.class);
    }

    public Date getExpirationDateFromToken(String token) {
        if (token == null) {
            return null;
        }
        return getAllClaims(token).getExpiration();
    }


    public String getIdFromToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (token == null) {
            return null;
        }
        return getAllClaims(token).get("id", String.class);
    }


    public boolean validateToken(String token) {
        try {
            getAllClaims(token);
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

}
