package com.project.auth_app.service;

import com.project.auth_app.model.Customer;
import com.project.auth_app.model.CustomerEnum;
import com.project.auth_app.model.StatusEnum;

import java.util.List;

public interface CustomerService {

    Customer createCustomer(Customer customer);
    Customer updateCustomer(Long customerId , StatusEnum status);
    Customer getCustomerByCustomerId(Long customerId);
    Customer getCustomerByTckn(String tckn);
    Customer getCustomerByVkn(String vkn);
    List<Customer> getAllCustomers(String sortBy, String sortDirection);
    List<Customer> getCustomerByStatus(StatusEnum status);
    List<Customer> getCustomerByCustomerType(CustomerEnum customerType);
    List<Customer> searchCustomers(String search, String sortBy, String sortDirection);}