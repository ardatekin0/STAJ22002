package com.project.auth_app.dto;

import lombok.Data;

@Data
public class RegisterDto {

    private String kullaniciAdi;
    private String ePosta;
    private String sifre;
    private String rol;
}
