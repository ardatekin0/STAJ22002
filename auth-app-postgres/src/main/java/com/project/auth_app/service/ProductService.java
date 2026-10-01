package com.project.auth_app.service;

import com.project.auth_app.model.Product;
import com.project.auth_app.model.StatusEnum;

import java.util.List;

public interface ProductService {

    Product createProduct(Long accountId);
    Product updateProduct(Long productId, StatusEnum status);
    Product getProductById(Long productId);
    List<Product> getProductByAccountId(Long accountId);
    List<Product> getProductByStatus(StatusEnum status);
    List<Product> getAllProducts(String sortBy, String sortDirection);
    List<Product> searchProducts(String search, String sortBy, String sortDirection);}
