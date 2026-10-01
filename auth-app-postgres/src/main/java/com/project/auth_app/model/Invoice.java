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
@Table(name = "invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", unique = true, nullable = false)
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", referencedColumnName = "account_id")
    @JsonIgnore
    private Account account;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id",referencedColumnName = "customer_id", nullable = false)
    @ToString.Exclude
    private Customer customer;

    private LocalDateTime createdAt;
    private BigDecimal totalPrice;
    private BigDecimal noTaxTotalPrice;
    private BigDecimal totalDiscountPrice;
    private BigDecimal noTaxTotalDiscountPrice;
    private BigDecimal totalTaxPrice;
    private LocalDateTime lastPaymentDate;
    private Long billingPeriod;

    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AccountInvoice> accountInvoices;

    public Long getAccountId() {
        return account != null ? account.getAccountId() : null;
    }
}
