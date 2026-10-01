package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.model.BatchJob;
import com.project.auth_app.model.BatchJobType;
import com.project.auth_app.service.BatchJobService;
import com.project.auth_app.service.InvoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final BatchJobService batchJobService;

    public InvoiceController(InvoiceService invoiceService, BatchJobService batchJobService) {
        this.invoiceService = invoiceService;
        this.batchJobService = batchJobService;
    }


    @AuditLogAnnotation(action = CREATE_INVOICE, entityType = "invoice")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PostMapping("/create")
    public ResponseEntity<?> createInvoice() {

        BatchJob batchJob = batchJobService.createJob(BatchJobType.INVOICE_BATCH);
        invoiceService.processInvoiceJob(batchJob.getId());

        return ResponseEntity.ok().body("Fatura oluşturma işlemi başlatıldı. Job ID: " + batchJob.getId());
    }


    @AuditLogAnnotation(action = GET_INVOICE,entityType = "invoice")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/{invoiceId}")
    public ResponseEntity<?> getInvoiceByInvoiceId(@PathVariable Long invoiceId){
        return ResponseEntity.ok().body(invoiceService.getInvoiceByInvoiceId(invoiceId));
    }


    @AuditLogAnnotation(action = GET_INVOICE,entityType = "invoice")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getInvoicesByAccountId(@PathVariable Long accountId){
        return ResponseEntity.ok().body(invoiceService.getInvoicesByAccountId(accountId));
    }


    @AuditLogAnnotation(action = GET_INVOICE,entityType = "invoice")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllInvoices(@RequestParam(defaultValue = "invoiceId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok().body(invoiceService.getAllInvoices(sortBy, sortDirection));
    }


    @AuditLogAnnotation(action = GET_INVOICE,entityType = "invoice")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/billing-period/{billingPeriod}")
    public ResponseEntity<?> getInvoicesByBillingPeriod(@PathVariable Long billingPeriod){
        return ResponseEntity.ok().body(invoiceService.getInvoicesByBillingPeriod(billingPeriod));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM')")
    public ResponseEntity<?> getInvoiceJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(batchJobService.getJob(jobId));
    }

    @AuditLogAnnotation(action = GET_INVOICE, entityType = "invoice")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/search")
    public ResponseEntity<?> searchInvoices(@RequestParam String search, @RequestParam(defaultValue = "invoiceId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok().body(invoiceService.searchInvoices(search, sortBy, sortDirection));
    }
}
