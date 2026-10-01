package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.DiscountRepository;
import com.project.auth_app.repository.ProductDiscountRepository;
import com.project.auth_app.repository.ProductRepository;
import com.project.auth_app.repository.ProductTariffRepository;
import com.project.auth_app.service.ProductDiscountService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class    ProductDiscountServiceImpl implements ProductDiscountService {

    private final ProductDiscountRepository productDiscountRepository;
    private final ProductRepository productRepository;
    private final DiscountRepository discountRepository;
    private final ProductTariffRepository productTariffRepository;
    private final ValidationService  validationService;

    public ProductDiscountServiceImpl(ProductDiscountRepository productDiscountRepository,ProductRepository productRepository,DiscountRepository discountRepository,ValidationService  validationService,  ProductTariffRepository productTariffRepository) {
        this.productDiscountRepository=productDiscountRepository;
        this.productRepository=productRepository;
        this.discountRepository=discountRepository;
        this.productTariffRepository=productTariffRepository;
        this.validationService=validationService;
    }


    @Override
    public ProductDiscount createProductDiscount(ProductDiscount productDiscount) {

        if (productDiscount.getProduct() == null || productDiscount.getProduct().getProductId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün id boş olamaz.");
        }

        if (productDiscount.getDiscount() == null || productDiscount.getDiscount().getDiscountId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount id boş olamaz.");
        }

        ProductTariff productTariff = productTariffRepository.findByProduct_ProductIdAndStatus(productDiscount.getProduct().getProductId(), StatusEnum.ACTIVE).orElseThrow(() -> new GenericException(HttpStatus.BAD_REQUEST, "Bu product için aktif ProductTariff bulunmalıdır."));
        Product product = productRepository.findByProductId(productDiscount.getProduct().getProductId()).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Product bulunamadı."));
        Discount discount = discountRepository.findById(productDiscount.getDiscount().getDiscountId()).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Discount id bulunamadı.Discount Id: " +  productDiscount.getDiscount().getDiscountId()));

        BigDecimal price = productTariff.getTariff().getTariffPrice();
        BigDecimal discountPrice = discount.getDiscountPrice();

        if (discount.getDiscountType() == DiscountEnum.TL && discountPrice.compareTo(price) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirim miktarı ürün fiyatından büyük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.FIXED && discountPrice.compareTo(price) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirimli fiyat ürün fiyatından büyük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.PERCENTAGE && discountPrice.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Yüzdesel indirim %100'den büyük olamaz.");
        }

        productDiscount.setProduct(product);
        productDiscount.setDiscount(discount);


        validationService.createProductDiscountValid(productDiscount);


        if (productDiscountRepository.existsByProduct_ProductIdAndStatus(product.getProductId(),StatusEnum.ACTIVE)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Bu product zaten bir productdiscounta sahip.Önce onu pasif yapın.");
        }

        if (discount.getStatus().equals(StatusEnum.PASSIVE)) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount aktif değil.Discount Id: " + discount.getDiscountId());
        }

        LocalDateTime discountStartDate = discount.getValidityStartDate();
        LocalDateTime discountEndDate = discount.getValidityEndDate();

        if (productDiscount.getStartDate().isBefore(discountStartDate) ||  productDiscount.getEndDate().isAfter(discountEndDate)) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün indiriminin başlangıç ve bitiş tarihleri indirimin başlangıç ve bitiş tarihleriyle uyumlu olmalı.");
        }

        productDiscount.setProductDiscountId(productDiscountRepository.getNextProductDiscountId());
        productDiscount.setStatus(productDiscount.getStatus() !=  null ? productDiscount.getStatus() : StatusEnum.ACTIVE);
        productDiscount.setUpdatedAt(LocalDateTime.now());

        return productDiscountRepository.save(productDiscount);
    }

    @Override
    public ProductDiscount updateProductDiscount(Long productDiscountId, ProductDiscount productDiscount) {

        if (productDiscount.getProduct() == null || productDiscount.getProduct().getProductId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün id boş olamaz.");
        }

        if (productDiscount.getDiscount() == null || productDiscount.getDiscount().getDiscountId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount id boş olamaz.");
        }

        ProductTariff productTariff = productTariffRepository.findByProduct_ProductIdAndStatus(productDiscount.getProduct().getProductId(), StatusEnum.ACTIVE).orElseThrow(() -> new GenericException(HttpStatus.BAD_REQUEST, "Bu product için aktif ProductTariff bulunmalıdır."));
        ProductDiscount existingProductDiscount = productDiscountRepository.findByProductDiscountId(productDiscountId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"ProductDiscount id bulunamadı.ProductDiscount Id: " + productDiscountId));

        Product product = productRepository.findByProductId(productDiscount.getProduct().getProductId()).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Product bulunamadı."));
        Discount discount = discountRepository.findById(productDiscount.getDiscount().getDiscountId()).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND,"Discount id bulunamadı.Discount Id: " +  productDiscount.getDiscount().getDiscountId()));

        BigDecimal price = productTariff.getTariff().getTariffPrice();
        BigDecimal discountPrice = discount.getDiscountPrice();

        if (discount.getDiscountType() == DiscountEnum.TL && discountPrice.compareTo(price) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirim miktarı ürün fiyatından büyük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.FIXED && discountPrice.compareTo(price) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirimli fiyat ürün fiyatından büyük olamaz.");
        }

        if (discount.getDiscountType() == DiscountEnum.PERCENTAGE && discountPrice.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Yüzdesel indirim %100'den büyük olamaz.");
        }

        if (!existingProductDiscount.getProduct().getProductId().equals(productDiscount.getProduct().getProductId())){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Product değiştirilemez.");
        }

        if (discount.getStatus().equals(StatusEnum.PASSIVE)) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount aktif değil. Discount Id: " + discount.getDiscountId());
        }

        if (productDiscount.getStartDate().isBefore(discount.getValidityStartDate()) || productDiscount.getEndDate().isAfter(discount.getValidityEndDate())) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Ürün indiriminin tarihleri discount geçerlilik tarihleriyle uyumlu olmalı.");
        }

        productDiscount.setProduct(product);
        productDiscount.setDiscount(discount);

        validationService.updateProductDiscountValid(productDiscount);

        boolean onlyStatusChanged = existingProductDiscount.getDiscount().getDiscountId().equals(productDiscount.getDiscount().getDiscountId())  && java.util.Objects.equals(existingProductDiscount.getStartDate(), productDiscount.getStartDate()) && java.util.Objects.equals(existingProductDiscount.getEndDate(), productDiscount.getEndDate());

        if (onlyStatusChanged){

            existingProductDiscount.setStatus(productDiscount.getStatus() != null ?  productDiscount.getStatus() : StatusEnum.ACTIVE);
            existingProductDiscount.setUpdatedAt(LocalDateTime.now());
            return productDiscountRepository.save(existingProductDiscount);
        }
        else {

            if (!productDiscount.getStartDate().isAfter(existingProductDiscount.getStartDate())) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır.");
            }

            existingProductDiscount.setEndDate(productDiscount.getStartDate().minusDays(1));


            existingProductDiscount.setStatus(StatusEnum.PASSIVE);
            existingProductDiscount.setUpdatedAt(LocalDateTime.now());
            productDiscountRepository.save(existingProductDiscount);

            ProductDiscount newProductDiscount = new ProductDiscount();

            newProductDiscount.setProduct(product);
            newProductDiscount.setDiscount(discount);
            newProductDiscount.setProductDiscountId(productDiscountRepository.getNextProductDiscountId());
            newProductDiscount.setStartDate(productDiscount.getStartDate());
            newProductDiscount.setEndDate(productDiscount.getEndDate());
            newProductDiscount.setStatus(productDiscount.getStatus() != null ? productDiscount.getStatus() : StatusEnum.ACTIVE);
            newProductDiscount.setUpdatedAt(LocalDateTime.now());

            return productDiscountRepository.save(newProductDiscount);
        }
    }

    @Override
    public List<ProductDiscount> getAllProductDiscounts(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "productDiscountId",
                "productId",
                "discountId",
                "startDate",
                "endDate",
                "status",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productDiscountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productDiscountRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public ProductDiscount getProductDiscountByProductDiscountId(Long productDiscountId) {
        return productDiscountRepository.findByProductDiscountId(productDiscountId).orElseThrow(()-> new GenericException(HttpStatus.BAD_REQUEST,"Product discount bulunamadı.ProductDiscount Id: " + productDiscountId));

    }

    @Override
    public List<ProductDiscount> getProductDiscountByDiscountId(Long discountId) {
        return productDiscountRepository.findByDiscount_DiscountId(discountId);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByProductId(Long productId) {
        return productDiscountRepository.findByProduct_ProductId(productId);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByStatus(StatusEnum status) {
        return productDiscountRepository.findByStatus(status);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByStartDate(LocalDateTime startDate) {
        return productDiscountRepository.findByStartDate(startDate);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByEndDate(LocalDateTime endDate) {
        return productDiscountRepository.findByEndDate(endDate);
    }

    @Override
    public void setStatusPassive(Long productDiscountId) {

        ProductDiscount productDiscount = productDiscountRepository.findByProductDiscountId(productDiscountId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"ProductDiscount bulunamadı.ProductDiscount Id: " + productDiscountId));
        productDiscount.setStatus(StatusEnum.PASSIVE);
        productDiscount.setUpdatedAt(LocalDateTime.now());
        productDiscountRepository.save(productDiscount);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByStatusAndEndDate(StatusEnum status, LocalDateTime endDate){
        return  productDiscountRepository.findByStatusAndEndDate(status,endDate);
    }

    @Override
    public List<ProductDiscount> getProductDiscountByStartAndEndDate(LocalDateTime startDate, LocalDateTime endDate) {
        return productDiscountRepository.findByStartDateBetween(startDate, endDate);
    }

    @Override
    public List<ProductDiscount> searchProductDiscounts(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "productDiscountId",
                "productId",
                "discountId",
                "startDate",
                "endDate",
                "status",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productDiscountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productDiscountRepository.searchProductDiscounts(search, sortBy, sortDirection);
    }
}
