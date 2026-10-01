package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Account;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/account")
@PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }


    @AuditLogAnnotation(action = CREATE_ACCOUNT,entityType = "account")
    @PostMapping("/create/{customerId}")
    public ResponseEntity<?> createAccount(@PathVariable Long customerId){
        try {
            accountService.createAccount(customerId);
            log.info("Account oluşturuldu.");

            return ResponseEntity.ok("Account oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Account oluşturulurken hata oluştu! "+ e.getMessage());
        }
    }

    @AuditLogAnnotation(action = UPDATE_ACCOUNT,entityType = "account")
    @PutMapping("/update/{accountId}")
    public ResponseEntity<?> updateAccount(@PathVariable Long accountId, @RequestBody StatusEnum status){

        try{
            accountService.updateAccount(accountId,status);
            log.info("Account güncellendi.");

            return ResponseEntity.ok("Account güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Account güncellenirken hata oluştu! " +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_ACCOUNT,entityType = "account")
    @GetMapping("/{accountId}")
    public ResponseEntity<?> getAccountByAccountId(@PathVariable Long accountId){

        try {
            Account account = accountService.getAccountByAccountId(accountId);

            return ResponseEntity.ok(account);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Account getirilirken hata oluştu! "  +  e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_ACCOUNT,entityType = "account")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getAccountsByCustomerId(@PathVariable Long customerId){

        try{
            List<Account> accounts = accountService.getAccountByCustomerId(customerId);

            return ResponseEntity.ok(accounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Account getirilirken hata oluştu! "  +  e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_ACCOUNT,entityType = "account")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAccountsByStatus(@PathVariable StatusEnum status){

        try {
            List<Account> accounts = accountService.getAccountByStatus(status);

            return ResponseEntity.ok(accounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Account getirilirken hata oluştu! "   +  e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_ACCOUNT, entityType = "account")
    @GetMapping("/search")
    public ResponseEntity<?> searchAccounts(@RequestParam String search, @RequestParam(defaultValue = "accountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection){
        try {
            List<Account> accounts = accountService.searchAccounts(search, sortBy, sortDirection);
            return ResponseEntity.ok(accounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Account aranırken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_ACCOUNT, entityType = "account")
    @GetMapping("/all")
    public ResponseEntity<?> getAllAccounts(@RequestParam(defaultValue = "accountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection){
        try {
            List<Account> accounts = accountService.getAllAccounts(sortBy, sortDirection);
            return ResponseEntity.ok(accounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Account getirilirken hata oluştu! " + e.getMessage());
        }
    }
}
