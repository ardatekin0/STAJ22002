package com.project.auth_app.service;

public interface RecaptchaService {
    void verify(String token);
}
