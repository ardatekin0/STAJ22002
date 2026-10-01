package com.project.auth_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", unique = true)
    private Long customerId;

    private String customerName;
    private String customerLastName;

    @Enumerated(EnumType.STRING)
    private CustomerEnum customerType;

    private String tckn;
    private String vkn;
    private StatusEnum status;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Account> accounts;
}