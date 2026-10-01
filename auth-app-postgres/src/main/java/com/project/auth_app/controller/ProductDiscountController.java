package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.ProductDiscount;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.ProductDiscountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/product-discount")
@PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
public class ProductDiscountController {

    private final ProductDiscountService productDiscountService;

    public  ProductDiscountController(ProductDiscountService productDiscountService) {
        this.productDiscountService = productDiscountService;
    }


    @AuditLogAnnotation(action = CREATE_PRODUCT_DISCOUNT,entityType = "product_discount")
    @PostMapping("/create")
    public ResponseEntity<?> createProductDiscount(@RequestBody ProductDiscount  productDiscount) {

        try {
            productDiscountService.createProductDiscount(productDiscount);
            log.info("Product discount oluşturuldu.");

            return ResponseEntity.ok("Product discount oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount oluşturulurken hata oluştu! " +  e.getMessage());
        }

    }


    @AuditLogAnnotation(action = UPDATE_PRODUCT_DISCOUNT,entityType = "product_discount")
    @PutMapping("/update/{productDiscountId}")
    public ResponseEntity<?> updateProductDiscount(@RequestBody ProductDiscount productDiscount, @PathVariable Long productDiscountId) {

        try {
            productDiscountService.updateProductDiscount(productDiscountId, productDiscount);
            log.info("Product discount güncellendi.");

            return ResponseEntity.ok("Product discount güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount güncellenirken hata oluştu! "  +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_DISCOUNT,entityType = "product_discount")
    @GetMapping("/{productDiscountId}")
    public ResponseEntity<?> getProductDiscountById(@PathVariable Long productDiscountId) {

        try {
            ProductDiscount productDiscount =  productDiscountService.getProductDiscountByProductDiscountId(productDiscountId);
            return ResponseEntity.ok(productDiscount);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount getirilirken hata oluştu! "  +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_DISCOUNT,entityType = "product_discount")
    @GetMapping("/all")
    public ResponseEntity<?> getAllProductDiscounts(@RequestParam(defaultValue = "productDiscountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<ProductDiscount> productDiscounts = productDiscountService.getAllProductDiscounts( sortBy, sortDirection);
            return ResponseEntity.ok(productDiscounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount getirilirken hata oluştu! "   +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_DISCOUNT,entityType = "product_discount")
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductDiscountByProductId(@PathVariable Long productId) {

        try {
            List<ProductDiscount> productDiscounts = productDiscountService.getProductDiscountByProductId(productId);
            return ResponseEntity.ok(productDiscounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount getirilirken hata oluştu! "   +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT_DISCOUNT,entityType = "product_discount")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getProductDiscountByStatus(@PathVariable StatusEnum status) {

        try {
            List<ProductDiscount> productDiscounts = productDiscountService.getProductDiscountByStatus(status);
            return ResponseEntity.ok(productDiscounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"ProductDiscount getirilirken hata oluştu! "   +  e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_PRODUCT_DISCOUNT, entityType = "product_discount")
    @GetMapping("/search")
    public ResponseEntity<?> searchProductDiscounts( @RequestParam String search, @RequestParam(defaultValue = "productDiscountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            List<ProductDiscount> productDiscounts = productDiscountService.searchProductDiscounts( search, sortBy, sortDirection);
            return ResponseEntity.ok(productDiscounts);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "ProductDiscount aranırken hata oluştu! " + e.getMessage());
        }
    }
}
