package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.AccountRepository;
import com.project.auth_app.repository.CustomerRepository;
import com.project.auth_app.repository.ProductRepository;
import com.project.auth_app.service.CustomerService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository  accountRepository;
    private final ProductRepository productRepository;
    private final ValidationService validationService;
    private final JdbcTemplate jdbcTemplate;

    public CustomerServiceImpl(CustomerRepository customerRepository, ValidationService validationService, AccountRepository accountRepository, ProductRepository productRepository, JdbcTemplate jdbcTemplate) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.validationService = validationService;
        this.jdbcTemplate = jdbcTemplate;
    }


    @Override
    public Customer createCustomer(Customer customer) {

        validationService.createCustomerValid(customer);

        if (customer.getCustomerType() == CustomerEnum.INDIVIDUAL && customerRepository.existsByTckn(customer.getTckn())) {
            throw new GenericException(HttpStatus.CONFLICT,"TCKN zaten mevcut.");
        }

        if(customer.getCustomerType() == CustomerEnum.CORPORATE && customerRepository.existsByVkn(customer.getVkn())) {
            throw new GenericException(HttpStatus.CONFLICT,"VKN zaten mevcut.");
        }


        Long nextId = jdbcTemplate.queryForObject("select nextval('customer_id_seq')", Long.class);
        int year = LocalDateTime.now().getYear();
        Long customerId = (year * 100000L) + nextId;


        customer.setCustomerId(customerId);
        customer.setStatus(customer.getStatus() != null ? customer.getStatus() : StatusEnum.ACTIVE);
        customer.setCreatedDate(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long customerId, StatusEnum status) {

        Customer existingCustomer = customerRepository.findByCustomerId(customerId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Customer id bulunamadı.Customer Id: " +  customerId));

        validationService.updateCustomerValid(status);

        if (status == StatusEnum.PASSIVE && existingCustomer.getStatus() != status) {
            List<Account> accounts = accountRepository.findByCustomer_CustomerId(customerId);

            for (Account account : accounts) {
                List<Product> products = productRepository.findByAccount_AccountId(account.getAccountId());
                for (Product product : products) {
                    List<ProductTariff>  productTariffs = product.getProductTariffs();
                    List<ProductDiscount>   productDiscounts = product.getProductDiscounts();

                    for (ProductTariff productTariff : productTariffs) {
                        productTariff.setStatus(StatusEnum.PASSIVE);
                    }

                    for (ProductDiscount productDiscount : productDiscounts) {
                        productDiscount.setStatus(StatusEnum.PASSIVE);
                    }
                    product.setStatus(StatusEnum.PASSIVE);
                }
                account.setStatus(StatusEnum.PASSIVE);
            }
        }

        existingCustomer.setStatus(status);
        existingCustomer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(existingCustomer);
    }

    @Override
    public Customer getCustomerByCustomerId(Long customerId) {
       return customerRepository.findByCustomerId(customerId).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND, "Customer id bulunamadı! Customer Id: " + customerId));
    }

    @Override
    public Customer getCustomerByTckn(String tckn) {
        return customerRepository.findByTckn(tckn).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND, "Müşteri bulunamadı! TCKN: " + tckn));
    }

    @Override
    public Customer getCustomerByVkn(String vkn) {
        return customerRepository.findByVkn(vkn).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND, "Müşteri bulunamadı! VKN: " + vkn));
    }

    @Override
    public List<Customer> getAllCustomers(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "customerId",
                "customerName",
                "customerLastName",
                "customerType",
                "tckn",
                "vkn",
                "status",
                "createdDate"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "customerId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return customerRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public List<Customer> getCustomerByStatus(StatusEnum status) {
        return customerRepository.findByStatus(status);
    }

    @Override
    public List<Customer> getCustomerByCustomerType(CustomerEnum customerType) {
        return customerRepository.findByCustomerType(customerType);
    }

    @Override
    public List<Customer> searchCustomers(String search, String sortBy, String sortDirection    ) {

        List<String> allowedSortFields = List.of(
                "customerId",
                "customerName",
                "customerLastName",
                "customerType",
                "tckn",
                "vkn",
                "status",
                "createdDate"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "customerId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }

        return customerRepository.searchCustomers(search, sortBy, sortDirection);
    }
}
