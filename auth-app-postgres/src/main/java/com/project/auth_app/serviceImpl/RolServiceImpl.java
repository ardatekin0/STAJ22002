package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Rol;
import com.project.auth_app.repository.RolRepository;
import com.project.auth_app.service.RolService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;
    private final ValidationService  validationService;

    public RolServiceImpl(RolRepository rolRepository, ValidationService validationService) {
        this.rolRepository = rolRepository;
        this.validationService = validationService;
    }


    @Override
    public Rol getRole(String ad) {
        return rolRepository.findByAd(ad).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Rol bulunamadı!"));
    }

    @Override
    public Rol addRole(Rol rol) {

        validationService.rolValid(rol.getAd());

        if(rolRepository.existsByAd(rol.getAd())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Bu rol sistemde tanımlı!");
        }
        return rolRepository.save(rol);
    }

    @Override
    public List<Rol> getAllRoles(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of("id", "ad", "aciklama");

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "ad";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return rolRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public List<Rol> searchRoller(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of("id", "ad", "aciklama");

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "ad";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return rolRepository.searchRoller(search, sortBy, sortDirection);
    }
}
