package com.project.auth_app.security;

import com.project.auth_app.model.ActionEnum;
import com.project.auth_app.model.AuditLog;
import com.project.auth_app.service.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;


@Slf4j
@Component
public class AuditFilter extends OncePerRequestFilter {

    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    public AuditFilter(AuditLogService auditLogService, JwtUtil jwtUtil) {
        this.auditLogService = auditLogService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {


        if(request.getRequestURI().startsWith("/swagger-ui") || request.getRequestURI().startsWith("/v3/api-docs") || request.getRequestURI().equals("/favicon.ico")) {

            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        }
        finally {

            if (request.getAttribute("auditLog") != null) {
                return;
            }

            Object exception = request.getAttribute("auditError");
            long duration = System.currentTimeMillis() - startTime;

            AuditLog auditLog = new AuditLog();

            auditLog.setUserIp(request.getRemoteAddr());
            auditLog.setUserAgent(request.getHeader("User-Agent"));
            auditLog.setEndpoint(request.getRequestURI());
            auditLog.setHttpMethod(request.getMethod());
            auditLog.setRequestPayload(null);
            auditLog.setResponsePayload(null);
            auditLog.setStatusCode(response.getStatus());
            auditLog.setDurationMs((int) duration);
            auditLog.setCreatedAt(LocalDateTime.now());
            auditLog.setEntityType(null);
            auditLog.setAction(ActionEnum.SECURITY_ERROR);

            if(exception != null){

                auditLog.setFaultMessage(exception.toString());
            }
            else if(response.getStatus() == 401){
                String message = "Unauthorized";
                auditLog.setFaultMessage(message);
            }
            else if(response.getStatus() == 403){
                String message = "Access Denied";
                auditLog.setFaultMessage(message);
            }
            else{
                auditLog.setFaultMessage(null);
            }


            String token = jwtUtil.getTokenFromRequest(request);

            if (token!=null) {
                try {
                    String kullaniciAdi = jwtUtil.getNameFromToken(request);
                    String kullaniciId = jwtUtil.getIdFromToken(request);

                    auditLog.setUserName(kullaniciAdi);
                    auditLog.setUserId(kullaniciId);
                    auditLog.setEntityId(kullaniciId);
                }
                catch (Exception e) {

                    auditLog.setUserName(null);
                    auditLog.setUserId(null);
                    auditLog.setEntityId(null);
                }

            }
            else  {

                auditLog.setUserName(null);
                auditLog.setUserId(null);
                auditLog.setEntityId(null);
            }

            auditLogService.save(auditLog);

            log.info("Auditlogkaydı: {}" , auditLog);

        }

    }

}
