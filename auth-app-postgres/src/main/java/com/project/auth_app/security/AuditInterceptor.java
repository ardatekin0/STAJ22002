package com.project.auth_app.security;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.dto.GenericResponseDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.mapper.UserMapper;
import com.project.auth_app.model.ActionEnum;
import com.project.auth_app.model.AuditLog;
import com.project.auth_app.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;


@Slf4j
@Component
public class AuditInterceptor implements HandlerInterceptor {


    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;
    private final UserMapper  userMapper;

    public AuditInterceptor(AuditLogService auditLogService, JwtUtil jwtUtil, UserMapper userMapper) {
        this.auditLogService = auditLogService;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String uri = request.getRequestURI();

        if(uri.startsWith("/swagger-ui") || uri.startsWith("/v3/api-docs") || uri.equals("/favicon.ico")) {
            return true;
        }

        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        AuditLogAnnotation auditLogAnnotation = handlerMethod.getMethodAnnotation(AuditLogAnnotation.class);


        request.setAttribute("startTime", System.currentTimeMillis());

        try {

        ActionEnum action =  null;
        String entityType = null;


        if(auditLogAnnotation != null){
            action = auditLogAnnotation.action();
            entityType = auditLogAnnotation.entityType();
        }



        AuditLog auditLog = new AuditLog();

        auditLog.setUserIp(request.getRemoteAddr());
        auditLog.setUserAgent(request.getHeader("User-Agent"));
        auditLog.setEndpoint(request.getRequestURI());
        auditLog.setHttpMethod(request.getMethod());
        auditLog.setRequestPayload(null);
        auditLog.setResponsePayload(null);
        auditLog.setStatusCode(response.getStatus());
        auditLog.setDurationMs(0);
        auditLog.setCreatedAt(LocalDateTime.now());
        auditLog.setAction(action);
        auditLog.setEntityType(entityType != null ? entityType : null);
        auditLog.setFaultMessage(null);


        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String kullaniciAdi = jwtUtil.getNameFromToken(request);
            String kullaniciId = jwtUtil.getIdFromToken(request);


            auditLog.setUserName(kullaniciAdi);
            auditLog.setUserId(kullaniciId);
            auditLog.setEntityId(kullaniciId);

        }
        else{
            auditLog.setUserName(null);
            auditLog.setUserId(null);
            auditLog.setEntityId(null);
        }

            request.setAttribute("auditLog", auditLog);
        }
        catch (Exception ex) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Audit log oluşturulurken hata oluştu!");
        }

        return  true;
    }


    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {


        Object responseBody = request.getAttribute("responseBody");
        Object requestBody = request.getAttribute("requestBody");
        Object exception = request.getAttribute("errors");


        AuditLog auditLog = (AuditLog) request.getAttribute("auditLog");
        if(auditLog == null){
            return;
        }

        if(exception != null){

            auditLog.setFaultMessage(exception.toString());
        }

        if(responseBody != null){
            if(responseBody instanceof String){
            GenericResponseDto  payloadResponseDto = new GenericResponseDto();

            payloadResponseDto.setStatus(response.getStatus());
            payloadResponseDto.setMessage(responseBody.toString());
            auditLog.setResponsePayload(userMapper.objectToJson(payloadResponseDto));
            }
            else {
                auditLog.setResponsePayload(userMapper.objectToJson(responseBody));
            }
        }


        auditLog.setStatusCode(response.getStatus());
        auditLog.setRequestPayload(requestBody != null ? userMapper.objectToJsonRequest(requestBody) : null);

        if (request.getAttribute("startTime") != null) {
        long duration = System.currentTimeMillis() - (long)  request.getAttribute("startTime");
            auditLog.setDurationMs((int) duration);
    }

        auditLogService.save(auditLog);

        log.info("Auditlogkaydı: {}" , auditLog);
    }
}
