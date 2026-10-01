package com.project.auth_app.service;

import com.project.auth_app.model.Account;
import com.project.auth_app.model.StatusEnum;

import java.util.List;

public interface AccountService {

    Account createAccount(Long customerId);
    Account updateAccount(Long accountId , StatusEnum status);
    Account getAccountByAccountId(Long accountId);
    List<Account> getAccountByCustomerId(Long customerId);
    List<Account> getAccountByStatus(StatusEnum status);
    List<Account> getAllAccounts(String sortBy, String sortDirection);
    List<Account> searchAccounts(String search, String sortBy, String sortDirection);
}
