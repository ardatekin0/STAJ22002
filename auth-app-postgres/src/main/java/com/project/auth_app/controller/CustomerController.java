package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.dto.CustomerDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Account;
import com.project.auth_app.model.Customer;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.AccountService;
import com.project.auth_app.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
public class CustomerController {

    private final CustomerService customerService;
    private final AccountService accountService;

    public CustomerController(CustomerService customerService, AccountService accountService) {
        this.customerService = customerService;
        this.accountService = accountService;
    }

    @AuditLogAnnotation(action = CREATE_CUSTOMER,entityType = "customer")
    @PostMapping("/create")
    public ResponseEntity<?> createCustomer(@RequestBody CustomerDto customerDto) {

        try {


            Customer customer = customerDto.getCustomer();
            List<Account> accounts = customerDto.getAccounts();


            customer.setId(null);
            customer.setCustomerId(null);
            customer.setCreatedDate(null);
            customer.setUpdatedAt(null);

            customer = customerService.createCustomer(customer);

            if (accounts != null &&  !accounts.isEmpty()) {

                for (Account account : accounts) {

                    accountService.createAccount(customer.getCustomerId());
                }
            }

            log.info("Customer oluşturuldu.Customer name: " + customer.getCustomerName() + " " + customer.getCustomerLastName());

            return ResponseEntity.ok("Customer oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer oluşturulurken hata oluştu! " + e.getMessage());
        }

    }


    @AuditLogAnnotation(action = UPDATE_CUSTOMER,entityType = "customer")
    @PutMapping("/update/{customerId}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long customerId, @RequestBody StatusEnum status){

        try {
            customerService.updateCustomer(customerId, status);

            log.info("Customer güncellendi.");

            return ResponseEntity.ok("Customer güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer güncellenirken hata oluştu! " + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_CUSTOMER,entityType = "customer")
    @GetMapping("/id/{customerId}")
    public ResponseEntity<?> getCustomerByCustomerId(@PathVariable Long customerId){
        try {
            Customer customer = customerService.getCustomerByCustomerId(customerId);

            return ResponseEntity.ok(customer);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer getirilirken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_CUSTOMER,entityType = "customer")
    @GetMapping("/all")
    public ResponseEntity<?> getAllCustomers(@RequestParam(defaultValue = "customerId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection){
        try {
            List<Customer> customers = customerService.getAllCustomers(sortBy, sortDirection);
            return ResponseEntity.ok(customers);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Customer getirilirken hata oluştu! " + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_CUSTOMER,entityType = "customer")
    @GetMapping("/vkn/{vkn}")
    public ResponseEntity<?> getCustomerByVkn(@PathVariable String vkn){
        try {
            Customer customer = customerService.getCustomerByVkn(vkn);
            return ResponseEntity.ok(customer);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer getirilirken hata oluştu! "  + e.getMessage());
        }

    }


    @AuditLogAnnotation(action = GET_CUSTOMER,entityType = "customer")
    @GetMapping("/tckn/{tckn}")
    public ResponseEntity<?> getCustomerByTckn(@PathVariable String tckn){
        try {
            Customer customer = customerService.getCustomerByTckn(tckn);
            return ResponseEntity.ok(customer);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer getirilirken hata oluştu! "  + e.getMessage());
        }

    }

    @AuditLogAnnotation(action = GET_CUSTOMER,entityType = "customer")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getCustomerByStatus(@PathVariable StatusEnum status){
        try {
            List<Customer> customers = customerService.getCustomerByStatus(status);
            return ResponseEntity.ok(customers);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Customer getirilirken hata oluştu! "   + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_CUSTOMER, entityType = "customer")
    @GetMapping("/search")
    public ResponseEntity<?> searchCustomers(@RequestParam String search, @RequestParam(defaultValue = "customerId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection){
        try {
            List<Customer> customers = customerService.searchCustomers(search, sortBy, sortDirection);
            return ResponseEntity.ok(customers);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST, "Customer aranırken hata oluştu! " + e.getMessage());
        }
    }
}
