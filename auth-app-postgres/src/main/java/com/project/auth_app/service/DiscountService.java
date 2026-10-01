package com.project.auth_app.service;

import com.project.auth_app.model.Discount;
import com.project.auth_app.model.DiscountEnum;
import com.project.auth_app.model.StatusEnum;

import java.math.BigDecimal;
import java.util.List;

public interface DiscountService {

    Discount createDiscount(Discount discount);
    Discount updateDiscount(Long discountId, Discount discount);
    List<Discount> getAllDiscounts(String sortBy, String sortDirection);
    Discount getDiscountById(Long discountId);
    List<Discount> getDiscountsByStatus(StatusEnum status);
    List<Discount> getDiscountsByPrice(BigDecimal price);
    List<Discount> getDiscountsByType(DiscountEnum discountType);
    Discount getDiscountByCode(Integer discountCode);
    void deleteDiscount(Long discountId);
    List<Discount> searchDiscounts(String search, String sortBy, String sortDirection);
}
