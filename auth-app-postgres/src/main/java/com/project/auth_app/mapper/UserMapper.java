package com.project.auth_app.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.auth_app.dto.*;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;


@Component
public class UserMapper {

    private final ObjectMapper objectMapper;

    public UserMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }


    public Kullanici registerToEntity(RegisterDto registerDto) {
        Kullanici kullanici = new Kullanici();
        kullanici.setKullaniciAdi(registerDto.getKullaniciAdi());
        kullanici.setEPosta(registerDto.getEPosta());
        kullanici.setSifre(registerDto.getSifre());

        if (registerDto.getRol() == null || registerDto.getRol().isBlank()) {
            kullanici.setRoller(List.of("ROLE_CALL_CENTER"));
        } else {
            kullanici.setRoller(List.of(registerDto.getRol()));
        }

        return kullanici;
    }


    public Rol rolToEntity(RolDto rolDto) {
        Rol rol = new Rol();
        rol.setAd(rolDto.getAd());
        rol.setAciklama(rolDto.getAciklama());
        return rol;
    }


    public AuthDto toAuthDto(String token, String message) {
        AuthDto authDto = new AuthDto();
        authDto.setToken(token);
        authDto.setMessage(message);
        return authDto;
    }


    public Map<String, Object> objectToJson(Object object) {

        if (object == null) {
            return null;
        }
        try {
            if (object instanceof Map || object.getClass().getPackageName().startsWith("com.project")) {
                return objectMapper.convertValue(object, Map.class);
            }
            return Map.of("value", object.toString());
        } catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Object JSON'a dönüştürülemedi.");
        }
    }


    public Map<String, Object> objectToJsonRequest(Object object) {
        if (object == null) {
            return null;
        }
        try {
            Map<String, Object> jsonObject;

            if (object instanceof Map || object.getClass().getPackageName().startsWith("com.project")) {
                jsonObject = objectMapper.convertValue(object, Map.class);
            } else {
                jsonObject = new java.util.HashMap<>(Map.of("value", object.toString()));
            }

            if (jsonObject != null && jsonObject.containsKey("sifre")) {
                if (jsonObject.get("sifre") != null && !jsonObject.get("sifre").toString().isEmpty()) {
                    jsonObject.put("sifre", "*******");
                }
            }

            return jsonObject;

        } catch (Exception e) {
           throw new GenericException(HttpStatus.BAD_REQUEST,"Object JSON requeste dönüştürülemedi.");
        }
    }
}
