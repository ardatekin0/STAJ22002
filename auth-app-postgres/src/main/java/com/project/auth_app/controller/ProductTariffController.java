package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.ProductTariffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/product-tariff")
@PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
public class ProductTariffController {

    private final ProductTariffService productTariffService;

    public ProductTariffController(ProductTariffService productTariffService) {
        this.productTariffService = productTariffService;
    }


    @AuditLogAnnotation(action = CREATE_PRODUCT_TARIFF,entityType = "product_tariff")
    @PostMapping("/create")
    public ResponseEntity<?> createProductTariff(@RequestBody ProductTariff productTariff) {

        try {
            productTariffService.createProductTariff(productTariff);
            log.info("Product Tariff oluşturuldu.");

            return ResponseEntity.ok("Product tariff oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff oluşturulurken hata oluştu! " +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = UPDATE_PRODUCT_TARIFF,entityType = "product_tariff")
    @PutMapping("/update/{productTariffId}")
    public ResponseEntity<?> updateProductTariff(@PathVariable Long productTariffId, @RequestBody ProductTariff productTariff) {

        try {
            productTariffService.updateProductTariff(productTariffId, productTariff);
            log.info("Product tariff güncellendi.");

            return ResponseEntity.ok("Product tariff güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff güncellenirken hata oluştu! "  + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_TARIFF,entityType = "product_tariff")
    @GetMapping("/{productTariffId}")
    public ResponseEntity<?> getProductTariffById(@PathVariable Long productTariffId) {

        try {
            ProductTariff productTariff = productTariffService.getProductTariffByProductTariffId(productTariffId);
            return ResponseEntity.ok(productTariff);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff getirilirken hata oluştu! "  +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_TARIFF,entityType = "product_tariff")
    @GetMapping("/all")
    public ResponseEntity<?> getAllProductTariffs(@RequestParam(defaultValue = "productTariffId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<ProductTariff> productTariffs = productTariffService.getAllProductTariffs(sortBy, sortDirection);
            return ResponseEntity.ok(productTariffs);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff getirilirken hata oluştu! "   +  e.getMessage());
        }

    }


    @AuditLogAnnotation(action = GET_PRODUCT_TARIFF,entityType = "product_tariff")
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductTariffsByProductId(@PathVariable Long productId) {

        try {
            List<ProductTariff>  productTariffs = productTariffService.getProductTariffsByProductId(productId);
            return ResponseEntity.ok(productTariffs);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff getirilirken hata oluştu! "   +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_TARIFF,entityType = "product_tariff")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getProductTariffsByStatus(@PathVariable StatusEnum status) {

        try {
            List<ProductTariff> productTariffs = productTariffService.getProductTariffsByStatus(status);
            return ResponseEntity.ok(productTariffs);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductTariff getirilirken hata oluştu! "   +  e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_PRODUCT_TARIFF, entityType = "product_tariff")
    @GetMapping("/search")
    public ResponseEntity<?> searchProductTariffs( @RequestParam String search, @RequestParam(defaultValue = "productTariffId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            List<ProductTariff> productTariffs = productTariffService.searchProductTariffs(search, sortBy, sortDirection);
            return ResponseEntity.ok(productTariffs);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "ProductTariff aranırken hata oluştu! " + e.getMessage());
        }
    }
}
