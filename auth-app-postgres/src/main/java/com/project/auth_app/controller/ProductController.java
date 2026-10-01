package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Product;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;


@Slf4j
@RestController
@RequestMapping("/api/product")
@PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
public class ProductController {

    private final ProductService productService;

    public  ProductController(ProductService productService) {
        this.productService = productService;
    }

    @AuditLogAnnotation(action = CREATE_PRODUCT,entityType = "product")
    @PostMapping("/create/{accountId}")
    public ResponseEntity<?> createProduct(@PathVariable Long  accountId) {

        try {
            productService.createProduct(accountId);
            log.info("Product oluşturuldu");

            return ResponseEntity.ok("Product oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Product oluşturulurken hata oluştu! " +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = UPDATE_PRODUCT,entityType = "product")
    @PutMapping("/update/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, @RequestBody StatusEnum status){

        try {
            productService.updateProduct(productId, status);
            log.info("Product güncellendi");

            return ResponseEntity.ok("Product güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Product güncellenirken hata oluştu! "  +  e.getMessage());
        }

    }


    @AuditLogAnnotation(action = GET_PRODUCT,entityType = "product")
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId){

        try {
            Product product = productService.getProductById(productId);

            return ResponseEntity.ok(product);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Product getirilirken hata oluştu! "   +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT,entityType = "product")
    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getProductsByAccountId(@PathVariable Long accountId){

        try {
            List<Product> products = productService.getProductByAccountId(accountId);
            return ResponseEntity.ok(products);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Product getirilirken hata oluştu! "   +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_PRODUCT,entityType = "product")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getProductsByStatus(@PathVariable StatusEnum status){

        try {
            List<Product> products = productService.getProductByStatus(status);
            return ResponseEntity.ok(products);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Product getirilirken hata oluştu! "    +  e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_PRODUCT, entityType = "product")
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String search, @RequestParam(defaultValue = "productId") String sortBy,@RequestParam(defaultValue = "asc") String sortDirection){
        try {
            List<Product> products =  productService.searchProducts(search, sortBy, sortDirection);
            return ResponseEntity.ok(products);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Product aranırken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_PRODUCT, entityType = "product")
    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts(@RequestParam(defaultValue = "productId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            List<Product> products = productService.getAllProducts(sortBy, sortDirection);
            return ResponseEntity.ok(products);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Productlar getirilirken hata oluştu! " + e.getMessage());
        }
    }
}
