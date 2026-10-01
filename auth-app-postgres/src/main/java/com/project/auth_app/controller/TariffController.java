package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.mapper.UserMapper;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.model.Tariff;
import com.project.auth_app.service.TariffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/tariff")
public class TariffController {

    private final TariffService  tariffService;
    private final UserMapper userMapper;

    public TariffController(TariffService tariffService, UserMapper userMapper) {
        this.tariffService = tariffService;
        this.userMapper = userMapper;
    }

    @AuditLogAnnotation(action = CREATE_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PostMapping("/create")
    public ResponseEntity<?> createTariff(@RequestBody Tariff tariff) {

        try {
            tariffService.createTariff(tariff);
            log.info("Tarife oluşturuldu.");

            return ResponseEntity.ok("Tarife oluşturuldu");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff oluşturulurken hata oluştu! " + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = UPDATE_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PutMapping("/update/{tariffId}")
    public ResponseEntity<?> updateTariff(@PathVariable Long tariffId, @RequestBody Tariff tariff) {

        try {
            tariffService.updateTariff(tariffId,tariff);
            log.info("Tarife güncellendi.");

            return ResponseEntity.ok("Tarife güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff güncellenirken hata oluştu! "  + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/{tariffId}")
    public ResponseEntity<?> getTariffById(@PathVariable Long tariffId) {

        try {
            Tariff tariff = tariffService.getTariffById(tariffId);
            return ResponseEntity.ok(tariff);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff getirilirken hata oluştu! "  + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllTariffs( @RequestParam(defaultValue = "tariffId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Tariff> tariffs = tariffService.getAllTariffs(sortBy, sortDirection);
            return ResponseEntity.ok(tariffs);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff getirilirken hata oluştu! "   + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTariffsByStatus(@PathVariable StatusEnum status) {

        try {
            List<Tariff> tariffs = tariffService.getTariffByStatus(status);
            return ResponseEntity.ok(tariffs);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff getirilirken hata oluştu! "   + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = DELETE_TARIFF,entityType = "tariff")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @DeleteMapping("/{tariffId}")
    public ResponseEntity<?> deleteTariff(@PathVariable Long tariffId) {

        try {
            tariffService.deleteTariff(tariffId);
            log.info("Tarife silindi.");

            return ResponseEntity.ok("Tarife silindi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff silinirken hata oluştu! "   + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_TARIFF, entityType = "tariff")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/search")
    public ResponseEntity<?> searchTariffs( @RequestParam String search, @RequestParam(defaultValue = "tariffId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            List<Tariff> tariffs = tariffService.searchTariffs(search, sortBy, sortDirection);
            return ResponseEntity.ok(tariffs);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Tarife aranırken hata oluştu! " + e.getMessage());
        }
    }
}
