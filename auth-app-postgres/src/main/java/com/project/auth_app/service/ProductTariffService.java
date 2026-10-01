package com.project.auth_app.service;

import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductTariffService {


    ProductTariff createProductTariff(ProductTariff productTariff);
    ProductTariff updateProductTariff(Long productTariffId , ProductTariff productTariff);
    List<ProductTariff> getAllProductTariffs(String sortBy, String sortDirection);
    ProductTariff getProductTariffByProductTariffId(Long productTariffId);
    List<ProductTariff> getProductTariffByTariffId(Long tariffId);
    List<ProductTariff> getProductTariffsByProductId(Long productId);
    List<ProductTariff> getProductTariffsByStatus(StatusEnum status);
    List<ProductTariff> getProductTariffsByStartDate(LocalDateTime startDate);
    List<ProductTariff> getProductTariffsByEndDate(LocalDateTime endDate);
    List<ProductTariff> getProductTariffsByStartAndEndDate(LocalDateTime startDate, LocalDateTime endDate);
    void setStatusPassive(Long productTariffId);
    List<ProductTariff> getProductTariffsByStatusAndEndDate(StatusEnum status,LocalDateTime now);
    List<ProductTariff> searchProductTariffs(String search, String sortBy, String sortDirection);
}
