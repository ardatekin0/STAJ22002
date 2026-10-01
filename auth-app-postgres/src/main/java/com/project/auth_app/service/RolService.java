package com.project.auth_app.service;

import com.project.auth_app.model.Rol;

import java.util.List;

public interface RolService {

    Rol getRole(String ad);
    Rol addRole(Rol rol);
    List<Rol> getAllRoles(String sortBy, String sortDirection);
    List<Rol> searchRoller(String search, String sortBy, String sortDirection);
}
