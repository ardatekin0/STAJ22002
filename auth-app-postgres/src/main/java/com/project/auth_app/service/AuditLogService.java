package com.project.auth_app.service;

import com.project.auth_app.model.AuditLog;

public interface AuditLogService {

    void save(AuditLog auditLog);
}
