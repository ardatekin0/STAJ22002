package com.project.auth_app.repository;

import com.project.auth_app.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceId(Long invoiceId);
    List<Invoice> findByLastPaymentDate(LocalDateTime lastPaymentDate);
    List<Invoice> findByAccount_AccountId(Long accountId);
    List<Invoice> findByBillingPeriod(Long billingPeriod);
    boolean existsByAccount_AccountIdAndBillingPeriod(Long accountId, Long billingPeriod);
    Optional<Invoice> findByAccount_AccountIdAndBillingPeriod(Long accountId,Long billingPeriod);

    @Query(value = """
    SELECT i.*
    FROM invoice i
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            cast(i.invoice_id AS text) NOT LIKE '%' || token || '%'
            AND cast(i.billing_period AS text) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'invoiceId' AND :sortDirection = 'asc' THEN i.invoice_id END ASC,
        CASE WHEN :sortBy = 'invoiceId' AND :sortDirection = 'desc' THEN i.invoice_id END DESC,

        CASE WHEN :sortBy = 'totalPrice' AND :sortDirection = 'asc' THEN i.total_price END ASC,
        CASE WHEN :sortBy = 'totalPrice' AND :sortDirection = 'desc' THEN i.total_price END DESC,

        CASE WHEN :sortBy = 'noTaxTotalPrice' AND :sortDirection = 'asc' THEN i.no_tax_total_price END ASC,
        CASE WHEN :sortBy = 'noTaxTotalPrice' AND :sortDirection = 'desc' THEN i.no_tax_total_price END DESC,

        CASE WHEN :sortBy = 'totalDiscountPrice' AND :sortDirection = 'asc' THEN i.total_discount_price END ASC,
        CASE WHEN :sortBy = 'totalDiscountPrice' AND :sortDirection = 'desc' THEN i.total_discount_price END DESC,

        CASE WHEN :sortBy = 'noTaxTotalDiscountPrice' AND :sortDirection = 'asc' THEN i.no_tax_total_discount_price END ASC,
        CASE WHEN :sortBy = 'noTaxTotalDiscountPrice' AND :sortDirection = 'desc' THEN i.no_tax_total_discount_price END DESC,

        CASE WHEN :sortBy = 'totalTaxPrice' AND :sortDirection = 'asc' THEN i.total_tax_price END ASC,
        CASE WHEN :sortBy = 'totalTaxPrice' AND :sortDirection = 'desc' THEN i.total_tax_price END DESC,

        CASE WHEN :sortBy = 'lastPaymentDate' AND :sortDirection = 'asc' THEN i.last_payment_date END ASC,
        CASE WHEN :sortBy = 'lastPaymentDate' AND :sortDirection = 'desc' THEN i.last_payment_date END DESC,

        CASE WHEN :sortBy = 'billingPeriod' AND :sortDirection = 'asc' THEN i.billing_period END ASC,
        CASE WHEN :sortBy = 'billingPeriod' AND :sortDirection = 'desc' THEN i.billing_period END DESC,

        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'asc' THEN i.created_at END ASC,
        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'desc' THEN i.created_at END DESC
    """, nativeQuery = true)
    List<Invoice> searchInvoices(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT i.*
    FROM invoice i
    ORDER BY
        CASE WHEN :sortBy = 'invoiceId' AND :sortDirection = 'asc' THEN i.invoice_id END ASC,
        CASE WHEN :sortBy = 'invoiceId' AND :sortDirection = 'desc' THEN i.invoice_id END DESC,

        CASE WHEN :sortBy = 'totalPrice' AND :sortDirection = 'asc' THEN i.total_price END ASC,
        CASE WHEN :sortBy = 'totalPrice' AND :sortDirection = 'desc' THEN i.total_price END DESC,

        CASE WHEN :sortBy = 'noTaxTotalPrice' AND :sortDirection = 'asc' THEN i.no_tax_total_price END ASC,
        CASE WHEN :sortBy = 'noTaxTotalPrice' AND :sortDirection = 'desc' THEN i.no_tax_total_price END DESC,

        CASE WHEN :sortBy = 'totalDiscountPrice' AND :sortDirection = 'asc' THEN i.total_discount_price END ASC,
        CASE WHEN :sortBy = 'totalDiscountPrice' AND :sortDirection = 'desc' THEN i.total_discount_price END DESC,

        CASE WHEN :sortBy = 'noTaxTotalDiscountPrice' AND :sortDirection = 'asc' THEN i.no_tax_total_discount_price END ASC,
        CASE WHEN :sortBy = 'noTaxTotalDiscountPrice' AND :sortDirection = 'desc' THEN i.no_tax_total_discount_price END DESC,

        CASE WHEN :sortBy = 'totalTaxPrice' AND :sortDirection = 'asc' THEN i.total_tax_price END ASC,
        CASE WHEN :sortBy = 'totalTaxPrice' AND :sortDirection = 'desc' THEN i.total_tax_price END DESC,

        CASE WHEN :sortBy = 'lastPaymentDate' AND :sortDirection = 'asc' THEN i.last_payment_date END ASC,
        CASE WHEN :sortBy = 'lastPaymentDate' AND :sortDirection = 'desc' THEN i.last_payment_date END DESC,

        CASE WHEN :sortBy = 'billingPeriod' AND :sortDirection = 'asc' THEN i.billing_period END ASC,
        CASE WHEN :sortBy = 'billingPeriod' AND :sortDirection = 'desc' THEN i.billing_period END DESC,

        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'asc' THEN i.created_at END ASC,
        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'desc' THEN i.created_at END DESC
    """, nativeQuery = true)
    List<Invoice> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
