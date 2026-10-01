package com.project.auth_app.dto;

import com.project.auth_app.model.Account;
import com.project.auth_app.model.Customer;
import lombok.Data;

import java.util.List;

@Data
public class CustomerDto {

    private Customer customer;
    private List<Account> accounts;
}
