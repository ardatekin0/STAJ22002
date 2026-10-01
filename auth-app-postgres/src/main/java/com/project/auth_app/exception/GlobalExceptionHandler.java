package com.project.auth_app.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final HttpServletRequest servletRequest;

    public GlobalExceptionHandler(HttpServletRequest servletRequest) {
        this.servletRequest = servletRequest;
    }


    @ExceptionHandler(GenericException.class)
    public ResponseEntity<?>  handleGenericException(GenericException ex) {

        log.info("GenericException: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ex.toResponse();
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        log.info("Validation Exception: {}", errors);
        servletRequest.setAttribute("errors", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {

        log.info("RuntimeException: {} ", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("hata", ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {

        log.info("BadCredentialsException: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kullanıcı adı veya şifre hatalı!");
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, String>> handleNullPointerException(NullPointerException ex) {

        log.info("NullPointerException: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("hata", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {

        log.info("IllegalArgumentException: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("hata", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDenied(AccessDeniedException ex){

        log.info("Exception: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {

        log.info("Exception: {}", ex.getMessage());
        servletRequest.setAttribute("errors", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("hata", ex.getMessage()));
    }

}
