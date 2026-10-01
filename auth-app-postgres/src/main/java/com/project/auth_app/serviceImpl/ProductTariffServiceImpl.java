package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Product;
import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.model.Tariff;
import com.project.auth_app.repository.ProductRepository;
import com.project.auth_app.repository.ProductTariffRepository;
import com.project.auth_app.repository.TariffRepository;
import com.project.auth_app.service.ProductTariffService;
import com.project.auth_app.service.ValidationService;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductTariffServiceImpl implements ProductTariffService {

    private final ProductTariffRepository productTariffRepository;
    private final TariffRepository tariffRepository;
    private final ProductRepository productRepository;
    private final ValidationService  validationService;

    public ProductTariffServiceImpl(ProductTariffRepository productTariffRepository, ValidationService validationService,TariffRepository tariffRepository, ProductRepository productRepository) {
        this.productTariffRepository = productTariffRepository;
        this.validationService = validationService;
        this.tariffRepository = tariffRepository;
        this.productRepository = productRepository;
    }


    @Override
    public ProductTariff createProductTariff(ProductTariff productTariff) {

        if(productTariff.getProduct() == null || productTariff.getProduct().getProductId() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün id boş olamaz.");
        }

        if (productTariff.getTariff() == null || productTariff.getTariff().getTariffId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tarife id boş olamaz.");
        }

        Product product = productRepository.findByProductId(productTariff.getProduct().getProductId()).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Product id bulunamadı.Product Id: " + productTariff.getProduct().getProductId()));

        Tariff tariff =  tariffRepository.findById(productTariff.getTariff().getTariffId()).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Tariff id bulunamadı.Tariff Id: " +  productTariff.getTariff().getTariffId()));

        productTariff.setProduct(product);
        productTariff.setTariff(tariff);

        validationService.createProductTariffValid(productTariff);

        if (productTariffRepository.existsByProduct_ProductIdAndStatus(product.getProductId(),StatusEnum.ACTIVE)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Bu product zaten bir producttariff e sahip.Önce onu pasif yapın.");
        }

        if (tariff.getStatus().equals(StatusEnum.PASSIVE)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff aktif değil.Tariff Id: " + tariff.getTariffId());
        }

        LocalDateTime tariffStartDate = tariff.getValidityStartDate();
        LocalDateTime tariffEndDate = tariff.getValidityEndDate();

        if (productTariff.getStartDate().isBefore(tariffStartDate) || productTariff.getEndDate().isAfter(tariffEndDate)){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarifenin başlangıç ve bitiş tarihleri tarifenin başlangıç ve bitiş tarihleriyle uyumlu olmalı.");
        }

        productTariff.setProductTariffId(productTariffRepository.getNextProductTariffId());
        productTariff.setStatus(productTariff.getStatus() != null ? productTariff.getStatus() : StatusEnum.ACTIVE);
        productTariff.setUpdatedAt(LocalDateTime.now());

        return productTariffRepository.save(productTariff);
    }

    @Override
    public ProductTariff updateProductTariff(Long productTariffId, ProductTariff productTariff) {

        if (productTariff.getProduct() ==  null || productTariff.getProduct().getProductId() == null){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Product id boş olamaz.");
        }

        if (productTariff.getTariff() == null ||  productTariff.getTariff().getTariffId() == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Tariff id boş olamaz.");
        }

        Product product = productRepository.findByProductId(productTariff.getProduct().getProductId()).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Product bulunamadı.Product Id: " + productTariff.getProduct().getProductId()));
        Tariff tariff = tariffRepository.findById(productTariff.getTariff().getTariffId()).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Tariff bulunamadı."));

        LocalDateTime tariffStartDate = tariff.getValidityStartDate();
        LocalDateTime tariffEndDate = tariff.getValidityEndDate();

        productTariff.setProduct(product);
        productTariff.setTariff(tariff);


        ProductTariff existingProductTariff = productTariffRepository.findByProductTariffId(productTariffId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"ProductTariff id bulunamadı.ProductTariff Id: " + productTariffId));

        if(!existingProductTariff.getProduct().getProductId().equals(productTariff.getProduct().getProductId())){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Product değiştirilemez.");
        }

        validationService.updateProductTariffValid(productTariff);

        boolean onlyStatusChanged = existingProductTariff.getTariff().getTariffId().equals(productTariff.getTariff().getTariffId()) && java.util.Objects.equals(existingProductTariff.getStartDate(), productTariff.getStartDate()) && java.util.Objects.equals(existingProductTariff.getEndDate(), productTariff.getEndDate());

        if (onlyStatusChanged){

            existingProductTariff.setStatus(productTariff.getStatus() !=  null ? productTariff.getStatus() : StatusEnum.ACTIVE);
            existingProductTariff.setUpdatedAt(LocalDateTime.now());
            return productTariffRepository.save(existingProductTariff);
        }
        else{

            if(productTariff.getStartDate() != null && existingProductTariff.getEndDate() != null && productTariff.getStartDate().isBefore(existingProductTariff.getEndDate())) {
                existingProductTariff.setEndDate(productTariff.getStartDate().minusDays(1));
            }

            if (!productTariff.getStartDate().isAfter(existingProductTariff.getStartDate())) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır.");
            }

            if (productTariff.getStartDate().isBefore(tariffStartDate) || productTariff.getEndDate().isAfter(tariffEndDate)){
                throw new GenericException(HttpStatus.BAD_REQUEST,"Ürün tarifenin başlangıç ve bitiş tarihleri tarifenin başlangıç ve bitiş tarihleriyle uyumlu olmalı.");
            }

            existingProductTariff.setStatus(StatusEnum.PASSIVE);
            existingProductTariff.setUpdatedAt(LocalDateTime.now());
            productTariffRepository.save(existingProductTariff);

            ProductTariff newProductTariff =  new ProductTariff();

            newProductTariff.setProduct(product);
            newProductTariff.setTariff(tariff);
            newProductTariff.setStartDate(productTariff.getStartDate());
            newProductTariff.setEndDate(productTariff.getEndDate());
            newProductTariff.setProductTariffId(productTariffRepository.getNextProductTariffId());
            newProductTariff.setStatus(productTariff.getStatus() != null ? productTariff.getStatus() : StatusEnum.ACTIVE);
            newProductTariff.setUpdatedAt(LocalDateTime.now());

            return productTariffRepository.save(newProductTariff);
        }
    }

    @Override
    public List<ProductTariff> getAllProductTariffs(String sortBy, String sortDirection ) {

        List<String> allowedSortFields = List.of(
                "productTariffId",
                "productId",
                "tariffId",
                "startDate",
                "endDate",
                "status",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productTariffId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productTariffRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public ProductTariff getProductTariffByProductTariffId(Long productTariffId) {
        return productTariffRepository.findByProductTariffId(productTariffId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND, "ProductTariff id bulunamadı.ProductTariff Id: " + productTariffId));
    }

    @Override
    public List<ProductTariff> getProductTariffByTariffId(Long tariffId) {
        return productTariffRepository.findByTariff_TariffId(tariffId);
    }

    @Override
    public List<ProductTariff> getProductTariffsByProductId(Long productId) {
        return  productTariffRepository.findByProduct_ProductId(productId);
    }

    @Override
    public List<ProductTariff> getProductTariffsByStatus(StatusEnum status) {
        return productTariffRepository.findByStatus(status);
    }

    @Override
    public List<ProductTariff> getProductTariffsByStartDate(LocalDateTime startDate) {
        return productTariffRepository.findByStartDate(startDate);
    }

    @Override
    public List<ProductTariff> getProductTariffsByEndDate(LocalDateTime endDate) {
        return productTariffRepository.findByEndDate(endDate);
    }

    @Override
    public void setStatusPassive(Long productTariffId) {

        ProductTariff productTariff = productTariffRepository.findByProductTariffId(productTariffId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"ProductTariff bulunamadı.ProductTariff Id: " + productTariffId));
        productTariff.setStatus(StatusEnum.PASSIVE);
        productTariff.setUpdatedAt(LocalDateTime.now());
        productTariffRepository.save(productTariff);
    }

    @Override
    public List<ProductTariff>  getProductTariffsByStatusAndEndDate( StatusEnum status,LocalDateTime now) {
        return productTariffRepository.findByStatusAndEndDateBefore(status,now);
    }

    @Override
    public List<ProductTariff> getProductTariffsByStartAndEndDate(LocalDateTime startDate, LocalDateTime endDate) {
        return productTariffRepository.findByStartDateBetween(startDate, endDate);
    }

    @Override
    public List<ProductTariff> searchProductTariffs(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "productTariffId",
                "productId",
                "tariffId",
                "startDate",
                "endDate",
                "status",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productTariffId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productTariffRepository.searchProductTariffs(search, sortBy, sortDirection);
    }
}
