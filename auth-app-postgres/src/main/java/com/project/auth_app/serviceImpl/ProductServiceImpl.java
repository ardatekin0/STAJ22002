package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.AccountRepository;
import com.project.auth_app.repository.ProductRepository;
import com.project.auth_app.service.ProductService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final AccountRepository  accountRepository;
    private final ValidationService validationService;
    private final JdbcTemplate jdbcTemplate;

    public ProductServiceImpl(ProductRepository productRepository, ValidationService validationService, AccountRepository accountRepository, JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.validationService = validationService;
        this.accountRepository = accountRepository;
        this.jdbcTemplate = jdbcTemplate;
    }


    @Override
    public Product createProduct(Long accountId) {

        validationService.createProductValid(accountId);

        Account account = accountRepository.findByAccountId(accountId).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Account id bulunamadı. Account Id: " + accountId));

        Long nextId = jdbcTemplate.queryForObject("select nextval('product_id_seq')", Long.class);

        Product product = new Product();

        product.setProductId(1000000L + nextId);
        product.setAccount(account);
        product.setStatus(StatusEnum.ACTIVE);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long productId, StatusEnum status) {

        Product existingProduct = productRepository.findByProductId(productId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Product id bulunamadı.Product Id: " + productId));


        if (status == StatusEnum.ACTIVE && existingProduct.getStatus() == StatusEnum.PASSIVE){
            createProduct(existingProduct.getAccount().getAccountId());
        }

        if(status == StatusEnum.PASSIVE && existingProduct.getStatus() ==  StatusEnum.ACTIVE) {
            List<ProductTariff> productTariffs = existingProduct.getProductTariffs();
            List<ProductDiscount> productDiscounts = existingProduct.getProductDiscounts();

            for(ProductTariff productTariff : productTariffs) {
                productTariff.setStatus(StatusEnum.PASSIVE);
            }

            for (ProductDiscount productDiscount : productDiscounts) {
                productDiscount.setStatus(StatusEnum.PASSIVE);
            }
        }

        validationService.updateProductValid(status);

        existingProduct.setStatus(status);
        existingProduct.setUpdatedAt(LocalDateTime.now());

        return productRepository.save(existingProduct);
    }

    @Override
    public Product getProductById(Long productId) {
        return productRepository.findByProductId(productId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Product id bulunamadı! Product Id: " + productId));
    }

    @Override
    public List<Product> getProductByAccountId(Long accountId) {
        return productRepository.findByAccount_AccountId(accountId);
    }

    @Override
    public List<Product> getProductByStatus(StatusEnum status) {
        return productRepository.findByStatus(status);
    }

    @Override
    public List<Product> getAllProducts(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "productId",
                "accountId",
                "status",
                "createdAt",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public List<Product> searchProducts(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "productId",
                "accountId",
                "status",
                "createdAt",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "productId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return productRepository.searchProducts(search, sortBy, sortDirection);
    }
}
