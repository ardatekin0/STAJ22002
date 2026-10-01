package com.project.auth_app.service;

import com.project.auth_app.model.*;

public interface ValidationService {

    void loginValid(String kullaniciAdi, String sifre);
    void registerValid(String kullaniciAdi,String ePosta, String sifre);
    void rolValid(String rolAd);
    void createCustomerValid(Customer customer);
    void updateCustomerValid(StatusEnum status);
    void validateIdentity(Customer customer);
    void createAccountValid(Long customerId);
    void updateAccountValid(StatusEnum status);
    void createProductValid(Long accountId);
    void updateProductValid(StatusEnum status);
    void createProductTariffValid(ProductTariff productTariff);
    void updateProductTariffValid(ProductTariff productTariff);
    void createProductDiscountValid(ProductDiscount productDiscount);
    void updateProductDiscountValid(ProductDiscount productDiscount);
    void createTariffValid(Tariff tariff);
    void updateTariffValid(Tariff tariff);
    void createDiscountValid(Discount discount);
    void updateDiscountValid(Discount discount);
}
