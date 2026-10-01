package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.AccountRepository;
import com.project.auth_app.repository.CustomerRepository;
import com.project.auth_app.repository.ProductRepository;
import com.project.auth_app.service.AccountService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository  accountRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ValidationService  validationService;
    private final JdbcTemplate jdbcTemplate;

    public AccountServiceImpl(AccountRepository accountRepository, ValidationService validationService,CustomerRepository customerRepository, ProductRepository productRepository, JdbcTemplate jdbcTemplate) {
        this.accountRepository = accountRepository;
        this.validationService = validationService;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.jdbcTemplate = jdbcTemplate;
    }


    @Override
    public Account createAccount(Long customerId) {

        validationService.createAccountValid(customerId);

        Customer customer = customerRepository.findByCustomerId(customerId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND, "Customer id bulunamadı. Customer Id: " +  customerId ));

            Long nextId = jdbcTemplate.queryForObject("select nextval('account_id_seq')", Long.class);
        int year = LocalDateTime.now().getYear();

        Long newId = (year * 10000L) + nextId;

        String accountName = customer.getCustomerName() + " " + customer.getCustomerLastName();
        int count = accountRepository.findByCustomer_CustomerId(customerId).size();

        if (count > 0){
            accountName += " " + (count + 1);
        }

        if(accountRepository.existsByCustomer_CustomerIdAndAccountName(customerId, accountName)){
            throw new GenericException(HttpStatus.CONFLICT,"Bu müşterinin bu isimde hesabı mevcut.");
        }

        Account account = new Account();

        account.setAccountId(newId);
        account.setCustomer(customer);
        account.setAccountName(accountName);
        account.setStatus(StatusEnum.ACTIVE);
        account.setCreatedDate(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());

        return accountRepository.save(account);
    }

    @Override
    public Account updateAccount(Long accountId, StatusEnum status) {

        Account existingAccount = accountRepository.findByAccountId(accountId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Account id bulunamadı.Account Id: " + accountId));

        validationService.updateAccountValid(status);

        if (status == StatusEnum.ACTIVE && existingAccount.getStatus() == StatusEnum.PASSIVE){
            createAccount(existingAccount.getCustomer().getCustomerId());
        }

        if (status == StatusEnum.PASSIVE && existingAccount.getStatus() != status) {
            List<Product> products = productRepository.findByAccount_AccountId(accountId);
                for (Product product : products) {
                    List<ProductTariff> productTariffs = product.getProductTariffs();
                    List<ProductDiscount> productDiscounts = product.getProductDiscounts();

                    for (ProductTariff productTariff : productTariffs) {
                        productTariff.setStatus(StatusEnum.PASSIVE);
                    }
                    for (ProductDiscount productDiscount : productDiscounts) {
                        productDiscount.setStatus(StatusEnum.PASSIVE);
                    }
                    product.setStatus(StatusEnum.PASSIVE);
                }
        }

        existingAccount.setStatus(status);
        existingAccount.setUpdatedAt(LocalDateTime.now());

        return accountRepository.save(existingAccount);
    }

    @Override
    public Account getAccountByAccountId(Long accountId) {
        return accountRepository.findByAccountId(accountId).orElseThrow(()->new GenericException(HttpStatus.NOT_FOUND, "Account id bulunamadı! Account Id: " + accountId));
    }

    @Override
    public List<Account> getAccountByCustomerId(Long customerId) {
        return accountRepository.findByCustomer_CustomerId(customerId);
    }

    @Override
    public List<Account> getAccountByStatus(StatusEnum status) {
        return accountRepository.findByStatus(status);
    }

    @Override
    public List<Account> getAllAccounts(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "accountId",
                "accountName",
                "customerId",
                "customerName",
                "status",
                "createdDate"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "accountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return accountRepository.findAllSorted(sortBy, sortDirection);
    }


    @Override
    public List<Account> searchAccounts(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "accountId",
                "accountName",
                "customerId",
                "customerName",
                "status",
                "createdDate"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "accountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return accountRepository.searchAccounts(search, sortBy, sortDirection);
    }
}
