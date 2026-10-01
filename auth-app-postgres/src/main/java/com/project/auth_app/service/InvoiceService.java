package com.project.auth_app.service;

import com.project.auth_app.model.DiscountEnum;
import com.project.auth_app.model.Invoice;

import java.math.BigDecimal;
import java.util.List;

public interface InvoiceService {

    List<Invoice> createInvoices();
    void processInvoiceJob(Long jobId);
    Invoice getInvoiceByInvoiceId(Long invoiceId);
    List<Invoice> getAllInvoices(String sortBy, String sortDirection);
    List<Invoice> getInvoicesByAccountId(Long accountId);
    List<Invoice> getInvoicesByBillingPeriod(Long billingPeriod);
    void createAccountInvoices();
    BigDecimal calculateDiscountPrice(BigDecimal discountPrice, BigDecimal price , DiscountEnum discountType);
    List<Invoice> searchInvoices(String search, String sortBy, String sortDirection);
}
