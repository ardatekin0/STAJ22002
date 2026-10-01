package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.model.Tariff;
import com.project.auth_app.repository.ProductTariffRepository;
import com.project.auth_app.repository.TariffRepository;
import com.project.auth_app.service.TariffService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TariffServiceImpl implements TariffService {

    private final TariffRepository tariffRepository;
    private final ProductTariffRepository  productTariffRepository;
    private final ValidationService validationService;

    public TariffServiceImpl(TariffRepository tariffRepository, ValidationService validationService,  ProductTariffRepository productTariffRepository) {
        this.tariffRepository = tariffRepository;
        this.validationService = validationService;
        this.productTariffRepository = productTariffRepository;
    }


    @Override
    public Tariff createTariff(Tariff tariff) {

        validationService.createTariffValid(tariff);

        if(tariffRepository.findByTariffName(tariff.getTariffName()).isPresent()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff name zaten mevcut.");
        }

        Integer code = tariffRepository.findMaxTariffCode().orElse(0) + 1;

        tariff.setTariffCode(code);
        tariff.setStatus(tariff.getStatus() != null ? tariff.getStatus() : StatusEnum.ACTIVE);
        tariff.setUpdatedAt(LocalDateTime.now());

        return tariffRepository.save(tariff);
    }

    @Override
    public Tariff updateTariff(Long tariffId, Tariff tariff) {

        Tariff existingTariff = tariffRepository.findById(tariffId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Tariff id bulunamadı.Tariff Id: " + tariffId));

        validationService.updateTariffValid(tariff);

        boolean onlyStatusChanged =
                existingTariff.getTariffName().equals(tariff.getTariffName()) &&
                        existingTariff.getTariffPrice().compareTo(tariff.getTariffPrice()) == 0 &&
                        existingTariff.getValidityStartDate().equals(tariff.getValidityStartDate()) &&
                        existingTariff.getValidityEndDate().equals(tariff.getValidityEndDate());

        if (onlyStatusChanged) {

            existingTariff.setStatus(tariff.getStatus() != null  ? tariff.getStatus() : StatusEnum.ACTIVE);
            existingTariff.setUpdatedAt(LocalDateTime.now());
            return tariffRepository.save(existingTariff);

        }
        else {

            if (tariff.getValidityStartDate().isBefore(existingTariff.getValidityStartDate())){
                throw new GenericException(HttpStatus.BAD_REQUEST,"Yeni tarife başlangıç tarihi, eski tarife başlangıç tarihinden önce olamaz.");
            }

            existingTariff.setStatus(StatusEnum.PASSIVE);
            existingTariff.setUpdatedAt(LocalDateTime.now());
            tariffRepository.save(existingTariff);

            Tariff newTariffVersion =  new Tariff();

            newTariffVersion.setTariffName(tariff.getTariffName());
            newTariffVersion.setTariffCode(existingTariff.getTariffCode());
            newTariffVersion.setTariffPrice(tariff.getTariffPrice());
            newTariffVersion.setStatus(tariff.getStatus());
            newTariffVersion.setValidityStartDate(tariff.getValidityStartDate());
            newTariffVersion.setValidityEndDate(tariff.getValidityEndDate());
            newTariffVersion.setUpdatedAt(LocalDateTime.now());

            return  tariffRepository.save(newTariffVersion);

        }
    }

    @Override
    public List<Tariff> getAllTariffs(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "tariffId",
                "tariffName",
                "tariffPrice",
                "tariffCode",
                "status",
                "validityStartDate",
                "validityEndDate",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "tariffId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return tariffRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public Tariff getTariffById(Long tariffId) {
        return tariffRepository.findById(tariffId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND, "Tariff id bulunamadı.Tariff Id: " + tariffId));
    }

    @Override
    public List<Tariff> getTariffByStatus(StatusEnum status) {
        return tariffRepository.findByStatus(status);
    }

    @Override
    public List<Tariff> getTariffsByPrice(BigDecimal tariffPrice) {
        return tariffRepository.findByTariffPrice(tariffPrice);
    }

    @Override
    public Tariff getTariffByCode(Integer tariffCode) {
        return tariffRepository.findByTariffCode(tariffCode).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Tariff code bulunamadı.Tariff Code: " +  tariffCode));
    }

    @Override
    public void deleteTariff(Long tariffId) {
        List<ProductTariff> productTariffs = productTariffRepository.findByTariff_TariffId(tariffId);

        if (!productTariffs.isEmpty()) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Bu tariff bir veya bir kaç producttariff tarafından kullanılıyor o yüzden silinemez.");
        }
        tariffRepository.deleteById(tariffId);
    }

    @Override
    public List<Tariff> searchTariffs(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "tariffId",
                "tariffName",
                "tariffPrice",
                "tariffCode",
                "status",
                "validityStartDate",
                "validityEndDate",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "tariffId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }

        return tariffRepository.searchTariffs(search, sortBy, sortDirection);
    }
}
