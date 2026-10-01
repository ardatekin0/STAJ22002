package com.project.auth_app.security;

import com.project.auth_app.repository.BlacklistedTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final BlacklistedTokenRepository  blacklistedTokenRepository;

    public  JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService, BlacklistedTokenRepository blacklistedTokenRepository) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        if(request.getRequestURI().startsWith("/swagger-ui")
                || request.getRequestURI().startsWith("/v3/api-docs")
                || request.getRequestURI().equals("/favicon.ico")) {

            filterChain.doFilter(request,response);
            return;
        }

        String token = jwtUtil.getTokenFromRequest(request);

        if(token != null) {

            if(blacklistedTokenRepository.existsByToken(token)){
                log.info("BLACKLIST TOKEN YAKALANDI");

                request.setAttribute("auditError", "Token geçersiz.");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED,"Token geçersiz!");
                return;
            }

            try {

                jwtUtil.getAllClaims(token);

                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    String name = jwtUtil.getNameFromToken(request);
                    List<String> roles = jwtUtil.getRolesFromToken(request);

                    if (name != null && roles != null) {

                        UserDetails userDetails = userDetailsService.loadUserByUsername(name);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
            catch (Exception e) {

                log.info("JWT doğrulama hatası: ", e);

                request.setAttribute("auditError", e.getMessage() != null ? e.getMessage() : "Geçersiz token");

                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}