package com.project.auth_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class GenericException extends RuntimeException {

    private final HttpStatus status;

    public GenericException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public ResponseEntity<?> toResponse(){
        return ResponseEntity.status(status).body(getMessage());
    }
}
