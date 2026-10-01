package com.project.auth_app.serviceImpl;


import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Kullanici;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.repository.KullaniciRepository;
import com.project.auth_app.security.JwtUtil;
import com.project.auth_app.service.BlacklistedTokenService;
import com.project.auth_app.service.KullaniciService;
import com.project.auth_app.service.ValidationService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class KullaniciServiceImpl implements KullaniciService {

    private final KullaniciRepository kullaniciRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenService  blacklistedTokenService;
    private final ValidationService validationService;

    public KullaniciServiceImpl(KullaniciRepository kullaniciRepository, BCryptPasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil, BlacklistedTokenService blacklistedTokenService,ValidationService validationService) {
        this.kullaniciRepository = kullaniciRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenService = blacklistedTokenService;
        this.validationService = validationService;
    }

    @Override
    public Kullanici register(Kullanici kullanici) {

        validationService.registerValid(kullanici.getKullaniciAdi(),kullanici.getEPosta(),kullanici.getSifre());

        if(kullaniciRepository.existsByKullaniciAdi(kullanici.getKullaniciAdi())){
            throw new GenericException(HttpStatus.CONFLICT,"Bu kullanıcı adı alınmış!");
        }

        if(kullaniciRepository.existsByePosta(kullanici.getEPosta())){
            throw new GenericException(HttpStatus.CONFLICT,"Bu e-posta alınmış!");
        }

        if (kullanici.getRoller() == null || kullanici.getRoller().isEmpty()) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Kullanıcı rolü seçilmelidir!");
        }

        String rol = kullanici.getRoller().get(0);

        if (!rol.equals("ROLE_CALL_CENTER") && !rol.equals("ROLE_TELEKOM")) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Geçersiz rol!");
        }

        kullanici.setSifre(passwordEncoder.encode(kullanici.getSifre()));
        kullanici.setStatus(StatusEnum.ACTIVE);


        return kullaniciRepository.save(kullanici);
    }

    @Override
        public Kullanici findByKullaniciAdi(String kullaniciAdi) {
        return kullaniciRepository.findByKullaniciAdi(kullaniciAdi).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND,"Kullanıcı bulunamadı: " + kullaniciAdi));
    }

    @Override
        public String login(String  kullaniciAdi, String sifre) {
        try{
            authManager.authenticate(new UsernamePasswordAuthenticationToken(kullaniciAdi,sifre));
            Kullanici kullanici = findByKullaniciAdi(kullaniciAdi);
            validationService.loginValid(kullaniciAdi,sifre);
            return jwtUtil.generateToken(kullaniciAdi,kullanici.getId(), kullanici.getRoller());
        }
        catch(AuthenticationException e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı adı veya şifre hatalı!");
        }
    }


    @Override
    public void logout(String token){

        if(token == null){
            throw new GenericException(HttpStatus.NOT_FOUND,"Token bulunamadı");
        }
        Date expirationDate = jwtUtil.getExpirationDateFromToken(token);
        blacklistedTokenService.blacklistToken(token,expirationDate);
    }


    @Override
    @Transactional
    public void deleteKullanici(String kullaniciAdi) {
        kullaniciRepository.deleteByKullaniciAdi(kullaniciAdi);
    }

    @Override
    public List<Kullanici> getCallCenterUsers(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of("kullaniciAdi", "ePosta", "status");

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "kullaniciAdi";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }

        return kullaniciRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    @Transactional
    public void updateUserRole(String kullaniciAdi, String yeniRol) {

        Kullanici kullanici = kullaniciRepository.findByKullaniciAdi(kullaniciAdi).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: " + kullaniciAdi));

        if (!kullanici.getRoller().contains("ROLE_CALL_CENTER")) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Sadece çağrı merkezi çalışanlarının rolü değiştirilebilir!");
        }

        kullanici.setRoller(List.of(yeniRol));
        kullaniciRepository.save(kullanici);
    }

    @Override
    public List<Kullanici> searchKullanicilar(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of("kullaniciAdi", "ePosta", "status");

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "kullaniciAdi";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return kullaniciRepository.searchKullanicilar(search, sortBy, sortDirection);
    }
}
