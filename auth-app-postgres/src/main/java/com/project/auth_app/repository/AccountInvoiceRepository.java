package com.project.auth_app.repository;

import com.project.auth_app.model.AccountInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccountInvoiceRepository extends JpaRepository<AccountInvoice,Long> {

    List<AccountInvoice> findByInvoice_InvoiceId(Long invoiceId);
    List<AccountInvoice> findByProduct_ProductId(Long productId);
    List<AccountInvoice> findByLastPaymentDate(LocalDateTime lastPaymentDate);
    List<AccountInvoice> findByProduct_Account_AccountId(Long accountId);
    boolean existsByProduct_ProductIdAndBillingPeriod(Long productId, Long billingPeriod);
    List<AccountInvoice> findByProduct_Account_AccountIdAndBillingPeriod(Long accountId, Long billingPeriod);
}
