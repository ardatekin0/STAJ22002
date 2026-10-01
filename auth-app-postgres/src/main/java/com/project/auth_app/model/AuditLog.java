package com.project.auth_app.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId;
    private String userName;
    private String userIp;
    private String userAgent;

    @Enumerated(EnumType.STRING)
    private ActionEnum action;

    private String entityType;
    private String entityId;
    private String endpoint;
    private String httpMethod;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> requestPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> responsePayload;

    private int statusCode;
    private String faultMessage;
    private int durationMs;
    private LocalDateTime createdAt;
}