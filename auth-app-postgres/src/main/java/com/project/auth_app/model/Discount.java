package com.project.auth_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "discount")
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Long discountId;

    private String discountName;
    private Integer discountCode;
    private DiscountEnum discountType;
    private BigDecimal discountPrice;
    private StatusEnum status;
    private LocalDateTime validityStartDate;
    private LocalDateTime validityEndDate;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "discount")
    @JsonIgnore
    @ToString.Exclude
    private List<ProductDiscount> productDiscounts;
}