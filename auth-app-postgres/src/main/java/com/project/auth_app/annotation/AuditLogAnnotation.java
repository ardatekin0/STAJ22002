package com.project.auth_app.annotation;

import com.project.auth_app.model.ActionEnum;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLogAnnotation {

    ActionEnum action();
    String entityType();
}
