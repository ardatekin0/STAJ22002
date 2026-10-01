package com.project.auth_app.service;

import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.model.Tariff;
import java.math.BigDecimal;
import java.util.List;

public interface TariffService {

    Tariff createTariff(Tariff tariff);
    Tariff updateTariff(Long tariffId,Tariff tariff);
    List<Tariff> getAllTariffs(String sortBy, String sortDirection);
    Tariff getTariffById(Long tariffId);
    List<Tariff> getTariffByStatus(StatusEnum status);
    List<Tariff> getTariffsByPrice(BigDecimal tariffPrice);
    Tariff getTariffByCode(Integer tariffCode);
    void deleteTariff(Long tariffId);
    List<Tariff> searchTariffs( String search, String sortBy, String sortDirection);
}