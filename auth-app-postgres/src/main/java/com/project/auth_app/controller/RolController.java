package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.dto.RolDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.mapper.UserMapper;
import com.project.auth_app.model.Rol;
import com.project.auth_app.service.RolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@RestController
@RequestMapping("/api/admin/roller")
@PreAuthorize("hasAuthority('ROLE_TELEKOM')")
public class RolController {

    private final RolService rolService;
    private final UserMapper userMapper;

    public RolController(RolService rolService, UserMapper userMapper) {
        this.rolService = rolService;
        this.userMapper = userMapper;
    }


    @AuditLogAnnotation(action = GET_ROLE,entityType = "role")
    @GetMapping("/rol")
    public ResponseEntity<?> getRole(String ad){
        try {
            Rol rol = rolService.getRole(ad);
            return ResponseEntity.ok(rol);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Role getirilirken hata oluştu! "    +  e.getMessage());
        }
    }


    @AuditLogAnnotation(action = ADD_ROLE,entityType = "role")
    @PostMapping("/ekle")
    public ResponseEntity<?> addRole(@RequestBody RolDto rolDto){

        try {
            Rol rol = userMapper.rolToEntity(rolDto);
            rolService.addRole(rol);

            return ResponseEntity.ok("Rol başarıyla kaydedildi!");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Role oluşturulurken hata oluştu! "    +  e.getMessage());
        }
    }


    @AuditLogAnnotation(action = GET_ROLES,entityType = "role")
    @GetMapping("/listele")
    public ResponseEntity<?> getAllRoles(@RequestParam(defaultValue = "ad") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Rol> rols = rolService.getAllRoles(sortBy, sortDirection);
            return ResponseEntity.ok(rols);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Role getirilirken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_ROLES, entityType = "role")
    @GetMapping("/ara")
    public ResponseEntity<?> searchRoller(@RequestParam String search, @RequestParam(defaultValue = "ad") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Rol> roller = rolService.searchRoller(search, sortBy, sortDirection);
            return ResponseEntity.ok(roller);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Roller aranırken hata oluştu! " + e.getMessage());
        }
    }
}
