package com.project.auth_app.serviceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.service.RecaptchaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class RecaptchaServiceImpl implements RecaptchaService {

    private final RestClient restClient;
    private final String secretKey;
    private final ObjectMapper objectMapper;

    public RecaptchaServiceImpl(
            RestClient restClient,
            @Value("${google.recaptcha.secret-key}") String secretKey,
            ObjectMapper objectMapper
    ) {
        this.restClient = restClient;
        this.secretKey = secretKey;
        this.objectMapper = objectMapper;
    }

    @Override
    public void verify(String token) {

        if (token == null || token.isBlank()) {
            throw new GenericException(
                    HttpStatus.BAD_REQUEST,
                    "reCAPTCHA doğrulaması gereklidir!"
            );
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("secret", secretKey);
        formData.add("response", token);

        String response = restClient.post()
                .uri("https://www.google.com/recaptcha/api/siteverify")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(String.class);

        try {
            JsonNode jsonResponse = objectMapper.readTree(response);

            if (!jsonResponse.path("success").asBoolean(false)) {
                throw new GenericException(
                        HttpStatus.BAD_REQUEST,
                        "reCAPTCHA doğrulaması başarısız!"
                );
            }

        } catch (GenericException e) {
            throw e;

        } catch (Exception e) {
            throw new GenericException(
                    HttpStatus.BAD_REQUEST,
                    "reCAPTCHA doğrulaması sırasında hata oluştu!"
            );
        }
    }
}