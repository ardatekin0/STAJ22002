package com.project.auth_app.service;

import com.project.auth_app.model.Kullanici;

import java.util.List;

public interface KullaniciService {

    Kullanici register(Kullanici kullanici);
    Kullanici findByKullaniciAdi(String kullaniciAdi);
    String login(String kullaniciAdi, String sifre);
    void logout(String token);
    void deleteKullanici(String kullaniciAdi);
    List<Kullanici> getCallCenterUsers(String sortBy, String sortDirection);
    void updateUserRole(String kullaniciAdi, String yeniRol);
    List<Kullanici> searchKullanicilar(String search, String sortBy, String sortDirection);
}