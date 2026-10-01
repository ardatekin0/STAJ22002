package com.project.auth_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "product_tariff")
public class ProductTariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_tariff_id", unique = true, nullable = false)
    private Long productTariffId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", referencedColumnName = "product_id")
    @JsonIgnoreProperties({"productTariffs","productDiscounts","account"})
    @ToString.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tariff_id", referencedColumnName = "tariff_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ToString.Exclude
    private Tariff tariff;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private StatusEnum status;
    private LocalDateTime updatedAt;
}
