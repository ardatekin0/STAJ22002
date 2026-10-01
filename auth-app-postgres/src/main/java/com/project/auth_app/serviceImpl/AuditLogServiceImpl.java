package com.project.auth_app.serviceImpl;

import com.project.auth_app.model.AuditLog;
import com.project.auth_app.repository.AuditLogRepository;
import com.project.auth_app.service.AuditLogService;
import org.springframework.stereotype.Service;

@Service
public class AuditLogServiceImpl implements AuditLogService {


    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void save(AuditLog auditLog) {
        auditLogRepository.save(auditLog);
    }
}
