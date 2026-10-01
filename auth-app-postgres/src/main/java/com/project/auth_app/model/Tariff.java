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
@Table(name = "tariff")
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id")
    private Long tariffId;

    private String tariffName;
    private BigDecimal tariffPrice;
    private Integer tariffCode;
    private StatusEnum status;
    private LocalDateTime validityStartDate;
    private LocalDateTime validityEndDate;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tariff")
    @JsonIgnore
    @ToString.Exclude
    private List<ProductTariff> productTariffs;
}