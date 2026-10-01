package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.dto.AuthDto;
import com.project.auth_app.dto.LoginDto;
import com.project.auth_app.dto.RegisterDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.mapper.UserMapper;
import com.project.auth_app.model.Kullanici;
import com.project.auth_app.security.JwtUtil;
import com.project.auth_app.service.KullaniciService;
import com.project.auth_app.service.RecaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;


@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final KullaniciService  kullaniciService;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RecaptchaService recaptchaService;

    private static final Logger userLogger = LoggerFactory.getLogger("USER_LOGGER");

    public AuthController(JwtUtil jwtUtil,KullaniciService kullaniciService,UserMapper userMapper,RecaptchaService recaptchaService) {
        this.jwtUtil = jwtUtil;
        this.kullaniciService = kullaniciService;
        this.userMapper = userMapper;
        this.recaptchaService = recaptchaService;
    }


    @AuditLogAnnotation(action = REGISTER_USER,entityType = "user")
    @PostMapping("/register")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    public ResponseEntity<?> registerDto(@RequestBody RegisterDto registerDto){

        try {
            Kullanici kullanici = userMapper.registerToEntity(registerDto);
            kullaniciService.register(kullanici);

            userLogger.info("{} kullanıcı adlı biri kayıt oldu." , kullanici.getKullaniciAdi());

            return ResponseEntity.ok("Kullanıcı başarıyla kaydedildi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı kayıt olurken hata oluştu! " + e.getMessage());
        }
    }


    @AuditLogAnnotation(action = LOGIN_USER, entityType = "user")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestHeader("X-Recaptcha-Token") String recaptchaToken, @RequestBody LoginDto loginDto) {

        try {
            recaptchaService.verify(recaptchaToken);
            String token = kullaniciService.login(loginDto.getKullaniciAdi(), loginDto.getSifre());
            AuthDto authDto = userMapper.toAuthDto(token, "Giriş Başarılı!");
            userLogger.info("{} kullanıcısı başarılı giriş yaptı.", loginDto.getKullaniciAdi());
            return ResponseEntity.ok(authDto);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Kullanıcı giriş yaparken hata oluştu! " + e.getMessage());
        }
    }


    @AuditLogAnnotation(action = LOGOUT_USER,entityType = "user")
    @SecurityRequirement(name = "BearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request){

        try{
            String token = jwtUtil.getTokenFromRequest(request);

            kullaniciService.logout(token);

            userLogger.info("{} çıkış yaptı." , jwtUtil.getNameFromToken(request));

            return  ResponseEntity.ok("Başarıyla çıkış yapıldı.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı çıkış yaparken hata oluştu! "  + e.getMessage());
        }
    }




    @AuditLogAnnotation(action = ADMIN_PAGE,entityType = "user")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @GetMapping("/admin")
    public ResponseEntity<?> getAdminPage(HttpServletRequest request){

        try {
            String name = jwtUtil.getNameFromToken(request);

            userLogger.info("{} kullanıcısı admin panele girdi." ,  name);

            return  ResponseEntity.ok("Başarıyla admin panele girildi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Admin sayfasına girerken hata oluştu! " + e.getMessage());
        }
    }



    @AuditLogAnnotation(action = DELETE_USER,entityType = "user")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @DeleteMapping("/{kullaniciAdi}")
    public ResponseEntity<?> deleteKullanici(@PathVariable(name = "kullaniciAdi") String kullaniciAdi, HttpServletRequest request){

        try {
            String name = jwtUtil.getNameFromToken(request);

            kullaniciService.findByKullaniciAdi(kullaniciAdi);
            kullaniciService.deleteKullanici(kullaniciAdi);

            userLogger.info("{} adlı kullanıcı {} kullanıcısı tarafından silindi." , kullaniciAdi , name);

            return  ResponseEntity.ok("Kullanıcı başarıyla silindi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı silinirken hata oluştu! " + e.getMessage());
        }
    }


    @AuditLogAnnotation(action = GET_PROFILE,entityType = "user")
    @PreAuthorize("hasAnyAuthority('ROLE_CALL_CENTER', 'ROLE_TELEKOM')")
    @GetMapping("/profil")
    public ResponseEntity<?> getProfil() {
        try {
            return ResponseEntity.ok("Başarıyla profil sayfasına girildi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Profil sayfasına girerken hata oluştu! "  + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_USER, entityType = "user")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @GetMapping("/cagri-merkezi")
    public ResponseEntity<?> getCallCenterUsers(@RequestParam(defaultValue = "kullaniciAdi") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Kullanici> kullanicilar = kullaniciService.getCallCenterUsers(sortBy, sortDirection);
            return ResponseEntity.ok(kullanicilar);
        } catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Çağrı merkezi kullanıcıları getirilirken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = UPDATE_USER_ROLE, entityType = "user")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PutMapping("/{kullaniciAdi}/rol")
    public ResponseEntity<?> updateUserRole(@PathVariable String kullaniciAdi, @RequestParam String yeniRol) {

        try {
            kullaniciService.updateUserRole(kullaniciAdi, yeniRol);

            return ResponseEntity.ok("Kullanıcı rolü başarıyla güncellendi.");
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Kullanıcı rolü güncellenirken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_USER, entityType = "user")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @GetMapping("/search")
    public ResponseEntity<?> searchKullanicilar(@RequestParam String search,@RequestParam(defaultValue = "kullaniciAdi") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            List<Kullanici> kullanicilar = kullaniciService.searchKullanicilar(search, sortBy, sortDirection);
            return ResponseEntity.ok(kullanicilar);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Kullanıcılar aranırken hata oluştu! " + e.getMessage());
        }
    }
}