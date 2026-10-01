package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.KullaniciRepository;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ValidationServiceImpl implements ValidationService {

    private final KullaniciRepository kullaniciRepository;
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final String NAME_REGEX = "^[a-zA-ZçÇğĞıİöÖşŞüÜ]+(?:\\s+[a-zA-ZçÇğĞıİöÖşŞüÜ]+)*$";

    public ValidationServiceImpl(KullaniciRepository kullaniciRepository) {
        this.kullaniciRepository = kullaniciRepository;
    }

    @Override
    public void loginValid(String kullaniciAdi, String sifre) {

        if(kullaniciAdi == null || kullaniciAdi.isBlank() || sifre == null || sifre.isBlank()) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı adı veya şifre boş olamaz.");
        }

        Kullanici kullanici = kullaniciRepository.findByKullaniciAdi(kullaniciAdi)
                .orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND,"Kullanıcı bulunamadı"));

        if(kullanici.getStatus().equals(StatusEnum.PASSIVE)){
            throw new GenericException(HttpStatus.FORBIDDEN,"Kullanıcı aktif değil!");
        }
    }

    @Override
    public void registerValid(String kullaniciAdi,String ePosta, String sifre){
        if (kullaniciAdi == null || kullaniciAdi.isBlank() || kullaniciAdi.length()<3){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Kullanıcı adı en az 3 karakterli olmalı!");
        }
        if (sifre ==  null || sifre.isBlank() || sifre.length()<6){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Şifre en az 6 karakterli olmalı!");
        }
        if (ePosta == null || ePosta.isBlank() || !ePosta.matches(EMAIL_REGEX)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"E-posta alanı dolu ve uygun formatta olmalı!");
        }
    }

    @Override
    public void rolValid(String rolAd) {
        if (rolAd == null || rolAd.isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Rol adı bilgisi olmalı!");
        }
    }

    @Override
    public void createCustomerValid(Customer customer) {

        if(customer.getCustomerName() == null || customer.getCustomerName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Müşteri adı boş olamaz.");
        }

        if (customer.getCustomerLastName() == null || customer.getCustomerLastName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Müşteri soyadı boş olamaz.");
        }

        if (!customer.getCustomerName().matches(NAME_REGEX) || !customer.getCustomerLastName().matches(NAME_REGEX)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ad veya soyad sadece harflerden oluşabilir.");
        }

        if (customer.getCustomerType() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Müşteri tipi boş olamaz.");
        }

        validateIdentity(customer);
    }

    @Override
    public void validateIdentity(Customer customer) {

        if (customer.getCustomerType() == CustomerEnum.INDIVIDUAL){

            if(customer.getTckn() == null || !customer.getTckn().matches("\\d{11}")){
                throw new GenericException(HttpStatus.BAD_REQUEST,"TCKN 11 karakter olmalı.");
            }

            if (customer.getVkn() != null && !customer.getVkn().isBlank()){
                throw new GenericException(HttpStatus.BAD_REQUEST,"VKN alanı boş olmalı.");
            }
        }

        else if(customer.getCustomerType() == CustomerEnum.CORPORATE){

            if (customer.getVkn() == null || !customer.getVkn().matches("\\d{10}")){
                throw new GenericException(HttpStatus.BAD_REQUEST,"VKN 10 karakter olmalı.");
            }

            if(customer.getTckn() != null && !customer.getTckn().isBlank()){
                throw new GenericException(HttpStatus.BAD_REQUEST,"TCKN alanı boş olmalı.");
            }
        }
    }

    @Override
    public void updateCustomerValid(StatusEnum status) {

        if (status == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Müşteri durumu alanı boş olamaz.");
        }
    }

    @Override
    public void createAccountValid(Long customerId) {

        if (customerId == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Müşteri id alanı boş olamaz.");
        }

    }

    @Override
    public void updateAccountValid(StatusEnum status) {

        if (status == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Hesap durumu boş olamaz.");
        }
    }

    @Override
    public void createProductValid(Long accountId) {

        if (accountId == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Hesap id alanı boş olamaz.");
        }
    }

    @Override
    public void updateProductValid(StatusEnum status) {

        if (status == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Hesap durumu alanı boş olamaz.");
        }
    }

    @Override
    public void createProductTariffValid(ProductTariff productTariff) {

        if (productTariff.getProduct() == null || productTariff.getProduct().getProductId() == null ){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün id boş olamaz.");
        }

        if (productTariff.getTariff() == null || productTariff.getTariff().getTariffId() == null  ){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife id boş olamaz.");
        }

        if (productTariff.getStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi boş olamaz.");
        }

        if(productTariff.getStartDate().isBefore(LocalDateTime.now())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi bugünden önce olamaz.");
        }

        if (productTariff.getTariff().getValidityStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarifenin geçerlilik başlangıç tarihi boş olamaz.");
        }

        if (productTariff.getStartDate().isBefore(productTariff.getTariff().getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi, tarifenin geçerlilik başlangıç tarihinden önce olamaz.");
        }

        if (productTariff.getEndDate() == null || productTariff.getEndDate().isBefore(productTariff.getStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife bitiş tarihi boş veya tarife başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void updateProductTariffValid(ProductTariff productTariff) {

        if (productTariff ==  null){
            throw  new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff boş olamaz.");
        }

        if (productTariff.getStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi boş olamaz.");
        }

        if (productTariff.getEndDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife bitiş tarihi boş olamaz.");
        }

        if (productTariff.getEndDate().isBefore(productTariff.getStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        if (productTariff.getStatus() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife durumu boş olamaz.");
        }

        if (productTariff.getStartDate().isBefore(productTariff.getTariff().getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi, tarife başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void createProductDiscountValid(ProductDiscount productDiscount) {

        if (productDiscount.getProduct() == null || productDiscount.getProduct().getProductId() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün id boş olamaz.");
        }

        if (productDiscount.getDiscount() == null ||  productDiscount.getDiscount().getDiscountId() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün indirim id boş olamaz.");
        }

        if (productDiscount.getStartDate() == null || productDiscount.getStartDate().isBefore(LocalDateTime.now())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün indirim başlangıç tarihi boş veya bugünden önce olamaz.");
        }

        if (productDiscount.getDiscount().getValidityStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim geçerlilik başlangıç tarihi boş olamaz.");
        }

        if (productDiscount.getStartDate().isBefore(productDiscount.getDiscount().getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün indirim başlangıç tarihi, indirimin geçerlilik başlangıç tarihinden önce olamaz.");
        }

        if (productDiscount.getEndDate() == null || productDiscount.getEndDate().isBefore(productDiscount.getStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün indirim bitiş tarihi boş veya indirim başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void updateProductDiscountValid(ProductDiscount productDiscount) {

        if (productDiscount.getDiscount().getDiscountId() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount id boş olamaz.");
        }

        if(productDiscount.getStartDate() == null || productDiscount.getStartDate().isBefore(LocalDateTime.now()) || productDiscount.getStartDate().isBefore(productDiscount.getDiscount().getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife başlangıç tarihi boş veya bugünden önce olamaz.");
        }

        if (productDiscount.getEndDate() == null || productDiscount.getEndDate().isBefore(productDiscount.getStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife bitiş tarihi boş veya tarife başlangıç tarihinden önce olamaz.");
        }

        if (productDiscount.getStatus() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarife durumu boş olamaz.");
        }
    }

    @Override
    public void createTariffValid(Tariff tariff) {

        if(tariff.getTariffName() == null || tariff.getTariffName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife adı boş olamaz.");
        }

        if (tariff.getTariffPrice()  == null || tariff.getTariffPrice().compareTo(BigDecimal.ZERO) <= 0){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife fiyatı 0'dan büyük olmalı.");
        }
        if (tariff.getValidityStartDate() == null || tariff.getValidityStartDate().isBefore(LocalDateTime.now())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim geçerlilik başlangıç tarihi boş veya bugünden önce olamaz.");
        }

        if (tariff.getValidityEndDate() == null || tariff.getValidityEndDate().isBefore(tariff.getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim bitiş tarihi boş veya indirim başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void updateTariffValid(Tariff tariff) {

        if (tariff.getTariffName() == null || tariff.getTariffName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife adı boş olamaz.");
        }

        if (tariff.getTariffPrice()  == null || tariff.getTariffPrice().compareTo(BigDecimal.ZERO) <= 0){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife fiyatı 0'dan büyük olmalı.");
        }

        if (tariff.getStatus() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife durumu alanı boş olamaz.");
        }

        if (tariff.getValidityStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim geçerlilik başlangıç tarihi boş olamaz.");
        }

        if (tariff.getValidityEndDate() == null || tariff.getValidityEndDate().isBefore(tariff.getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim bitiş tarihi boş veya indirim başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void createDiscountValid(Discount discount) {

        if (discount.getDiscountType() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim türü boş olamaz.");
        }

        if (discount.getDiscountPrice()  == null || discount.getDiscountPrice().compareTo(BigDecimal.ZERO) <= 0){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim miktarı 0'dan küçük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.PERCENTAGE) {
            if (discount.getDiscountPrice().compareTo(BigDecimal.ZERO) < 0 || discount.getDiscountPrice().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Yüzdesel indirim 0 ile 100 arasında olmalıdır.");
            }
        }

        if(discount.getDiscountName() == null || discount.getDiscountName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim adı boş olamaz.");
        }

        if (discount.getValidityStartDate() == null || discount.getValidityStartDate().isBefore(LocalDateTime.now())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim geçerlilik başlangıç tarihi boş veya bugünden önce olamaz.");
        }

        if (discount.getValidityEndDate() == null || discount.getValidityEndDate().isBefore(discount.getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim bitiş tarihi boş veya indirim başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    public void updateDiscountValid(Discount discount) {

        if (discount.getDiscountType() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim türü boş olamaz.");
        }

        if (discount.getDiscountPrice()  == null || discount.getDiscountPrice().compareTo(BigDecimal.ZERO) <= 0){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim miktarı 0'dan küçük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.PERCENTAGE) {
            if (discount.getDiscountPrice().compareTo(BigDecimal.ZERO) < 0 || discount.getDiscountPrice().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Yüzdesel indirim 0 ile 100 arasında olmalıdır.");
            }
        }

        if(discount.getDiscountName() == null || discount.getDiscountName().isBlank()){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim adı boş olamaz.");
        }

        if (discount.getStatus() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim durumu alanı boş olamaz.");
        }

        if (discount.getValidityStartDate() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim geçerlilik başlangıç tarihi boş olamaz.");
        }

        if (discount.getValidityEndDate() == null || discount.getValidityEndDate().isBefore(discount.getValidityStartDate())){
            throw new GenericException(HttpStatus.BAD_REQUEST,"İndirim bitiş tarihi boş veya indirim başlangıç tarihinden önce olamaz.");
        }
    }


}