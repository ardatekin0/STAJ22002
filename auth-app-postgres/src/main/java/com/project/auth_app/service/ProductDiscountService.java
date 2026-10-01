package com.project.auth_app.service;

import com.project.auth_app.model.DiscountEnum;
import com.project.auth_app.model.ProductDiscount;
import com.project.auth_app.model.StatusEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ProductDiscountService {

    ProductDiscount createProductDiscount(ProductDiscount productDiscount);
    ProductDiscount updateProductDiscount(Long productDiscountId, ProductDiscount productDiscount);
    List<ProductDiscount> getAllProductDiscounts( String sortBy, String sortDirection);
    ProductDiscount  getProductDiscountByProductDiscountId(Long productDiscountId);
    List<ProductDiscount> getProductDiscountByDiscountId(Long discountId);
    List<ProductDiscount> getProductDiscountByProductId(Long productId);
    List<ProductDiscount> getProductDiscountByStatus(StatusEnum status);
    List<ProductDiscount> getProductDiscountByStartDate(LocalDateTime startDate);
    List<ProductDiscount> getProductDiscountByEndDate(LocalDateTime endDate);
    List<ProductDiscount> getProductDiscountByStartAndEndDate(LocalDateTime startDate, LocalDateTime endDate);
    void setStatusPassive(Long productDiscountId);
    List<ProductDiscount> getProductDiscountByStatusAndEndDate(StatusEnum status, LocalDateTime endDate);
    List<ProductDiscount> searchProductDiscounts(String search, String sortBy, String sortDirection);
}
