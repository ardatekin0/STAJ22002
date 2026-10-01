package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.*;
import com.project.auth_app.service.BatchJobService;
import com.project.auth_app.service.InvoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AccountInvoiceRepository accountInvoiceRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final ProductTariffRepository productTariffRepository;
    private final ProductDiscountRepository productDiscountRepository;
    private final JdbcTemplate jdbcTemplate;
    private final BatchJobService batchJobService;
    private final Executor taskExecutor;
    private final Executor invoiceTaskExecutor;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository, AccountInvoiceRepository accountInvoiceRepository, CustomerRepository customerRepository, AccountRepository accountRepository, ProductRepository productRepository, ProductTariffRepository productTariffRepository, ProductDiscountRepository productDiscountRepository, JdbcTemplate jdbcTemplate, BatchJobService batchJobService, @Qualifier("taskExecutor") Executor taskExecutor, @Qualifier("invoiceTaskExecutor") Executor invoiceTaskExecutor) {
        this.invoiceRepository = invoiceRepository;
        this.accountInvoiceRepository = accountInvoiceRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.productTariffRepository = productTariffRepository;
        this.productDiscountRepository = productDiscountRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.batchJobService = batchJobService;
        this.taskExecutor = taskExecutor;
        this.invoiceTaskExecutor = invoiceTaskExecutor;
    }

    @Override
    public List<Invoice> createInvoices() {

        long startTime = System.currentTimeMillis();

        int year = LocalDateTime.now().getYear();
        int month = LocalDateTime.now().getMonthValue();
        long billingPeriod = (year * 100L) + month;

        List<Customer> customers = customerRepository.findByStatus(StatusEnum.ACTIVE);

        log.info("Invoice oluşturma başladı. customerCount={}, billingPeriod={}, thread={}", customers.size(), billingPeriod, Thread.currentThread().getName());

        List<CompletableFuture<List<Invoice>>> futures = new ArrayList<>();

        for (Customer customer : customers) {

            CompletableFuture<List<Invoice>> future = CompletableFuture.supplyAsync(() -> createInvoiceForCustomer(customer, billingPeriod), invoiceTaskExecutor);

            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        List<Invoice> invoices = new ArrayList<>();

        for (CompletableFuture<List<Invoice>> future : futures) {
            invoices.addAll(future.join());
        }

        long duration = System.currentTimeMillis() - startTime;

        log.info("Invoice oluşturma tamamlandı. customerCount={}, invoiceCount={}, durationMs={}, thread={}", customers.size(), invoices.size(), duration, Thread.currentThread().getName());

        return invoices;
    }



    private List<Invoice> createInvoiceForCustomer(Customer customer, long billingPeriod) {

        long startTime = System.currentTimeMillis();

        log.info("Invoice customer task başladı. customerId={}, thread={}", customer.getCustomerId(), Thread.currentThread().getName());

        List<Invoice> invoices = new ArrayList<>();

        List<Account> accounts = accountRepository.findByCustomer_CustomerIdAndStatus(customer.getCustomerId(), StatusEnum.ACTIVE);

        for (Account account : accounts) {

            Invoice invoice = invoiceRepository.findByAccount_AccountIdAndBillingPeriod(account.getAccountId(), billingPeriod).orElse(null);

            if (invoice == null) {

                invoice = new Invoice();

                invoice.setCustomer(customer);
                invoice.setAccount(account);
                invoice.setCreatedAt(LocalDateTime.now());
                invoice.setBillingPeriod(billingPeriod);

                Long nextId = jdbcTemplate.queryForObject("select nextval('invoice_id_seq')", Long.class);
                Long invoiceId = (billingPeriod * 1000000L) + nextId;

                invoice.setInvoiceId(invoiceId);
            }

            List<AccountInvoice> accountInvoices = accountInvoiceRepository.findByProduct_Account_AccountIdAndBillingPeriod(account.getAccountId(), billingPeriod);

            if (accountInvoices.isEmpty()) {
                continue;
            }

            BigDecimal noTaxTotalPrice = BigDecimal.ZERO;
            BigDecimal noTaxTotalDiscountPrice = BigDecimal.ZERO;
            LocalDateTime lastPaymentDate = null;

            for (AccountInvoice accountInvoice : accountInvoices) {

                noTaxTotalPrice = noTaxTotalPrice.add(accountInvoice.getTotalPrice());
                noTaxTotalDiscountPrice = noTaxTotalDiscountPrice.add(accountInvoice.getDiscount());
                lastPaymentDate = accountInvoice.getLastPaymentDate();
            }

            BigDecimal totalTaxPrice = noTaxTotalPrice.multiply(BigDecimal.valueOf(20)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal totalPrice = noTaxTotalPrice.add(totalTaxPrice);
            BigDecimal originalNoTaxTotalPrice = noTaxTotalPrice.add(noTaxTotalDiscountPrice);
            BigDecimal originalTaxPrice = originalNoTaxTotalPrice.multiply(BigDecimal.valueOf(20)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal originalTotalPrice = originalNoTaxTotalPrice.add(originalTaxPrice);
            BigDecimal totalDiscountPrice = originalTotalPrice.subtract(totalPrice);

            invoice.setTotalPrice(totalPrice);
            invoice.setNoTaxTotalPrice(noTaxTotalPrice);
            invoice.setTotalDiscountPrice(totalDiscountPrice);
            invoice.setNoTaxTotalDiscountPrice(noTaxTotalDiscountPrice);
            invoice.setTotalTaxPrice(totalTaxPrice);
            invoice.setLastPaymentDate(lastPaymentDate);

            Invoice savedInvoice = invoiceRepository.save(invoice);

            for (AccountInvoice accountInvoice : accountInvoices) {

                accountInvoice.setInvoice(savedInvoice);

                accountInvoiceRepository.save(accountInvoice);
            }

            invoices.add(savedInvoice);
        }

        long duration = System.currentTimeMillis() - startTime;

        log.info("Invoice customer task tamamlandı. customerId={}, invoiceCount={}, durationMs={}, thread={}", customer.getCustomerId(), invoices.size(), duration, Thread.currentThread().getName());

        return invoices;
    }

    @Async("taskExecutor")
    @Override
    public void processInvoiceJob(Long jobId) {

        long startTime = System.currentTimeMillis();

        log.info("Invoice batch başladı. jobId={}, thread={}", jobId, Thread.currentThread().getName());

        try {

            batchJobService.startJob(jobId);

            createAccountInvoices();

            createInvoices();

            batchJobService.completeJob(jobId);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Invoice batch tamamlandı. jobId={}, durationMs={}, thread={}", jobId, duration, Thread.currentThread().getName());

        } catch (Exception e) {

            log.error("Invoice batch başarısız. jobId={}, error={}, thread={}", jobId, e.getMessage(), Thread.currentThread().getName(), e);

            batchJobService.failJob(jobId, e.getMessage());
        }
    }

    @Override
    public Invoice getInvoiceByInvoiceId(Long invoiceId) {

        return invoiceRepository.findByInvoiceId(invoiceId).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Invoice bulunamadı. Invoice Id: " + invoiceId));
    }

    @Override
    public List<Invoice> getAllInvoices(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "invoiceId",
                "totalPrice",
                "noTaxTotalPrice",
                "totalDiscountPrice",
                "noTaxTotalDiscountPrice",
                "totalTaxPrice",
                "lastPaymentDate",
                "billingPeriod",
                "createdAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "invoiceId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return invoiceRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public List<Invoice> getInvoicesByAccountId(Long accountId) {
        return invoiceRepository.findByAccount_AccountId(accountId);
    }

    @Override
    public List<Invoice> getInvoicesByBillingPeriod(Long billingPeriod) {

        return invoiceRepository.findByBillingPeriod(billingPeriod);
    }

    @Override
    public void createAccountInvoices() {

        long startTime = System.currentTimeMillis();
        int year = LocalDateTime.now().getYear();
        int month = LocalDateTime.now().getMonthValue();
        long billingPeriod = (year * 100L) + month;

        List<Customer> customers = customerRepository.findByStatus(StatusEnum.ACTIVE);

        log.info("AccountInvoice oluşturma başladı. customerCount={}, billingPeriod={}, thread={}", customers.size(), billingPeriod, Thread.currentThread().getName());

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (Customer customer : customers) {

            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> createAccountInvoicesForCustomer(customer, billingPeriod), invoiceTaskExecutor);

            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        long duration = System.currentTimeMillis() - startTime;

        log.info("AccountInvoice oluşturma tamamlandı. customerCount={}, durationMs={}, thread={}", customers.size(), duration, Thread.currentThread().getName());
    }


    private void createAccountInvoicesForCustomer(Customer customer, long billingPeriod) {

        long startTime = System.currentTimeMillis();

        log.info("AccountInvoice customer task başladı. customerId={}, thread={}", customer.getCustomerId(), Thread.currentThread().getName());

        List<Account> accounts = accountRepository.findByCustomer_CustomerIdAndStatus(customer.getCustomerId(), StatusEnum.ACTIVE);

        for (Account account : accounts) {

            List<Product> products = productRepository.findByAccount_AccountIdAndStatus(account.getAccountId(), StatusEnum.ACTIVE);

            for (Product product : products) {

                if (accountInvoiceRepository.existsByProduct_ProductIdAndBillingPeriod(product.getProductId(), billingPeriod)) {
                    continue;
                }

                ProductTariff productTariff = productTariffRepository.findByProduct_ProductIdAndStatusWithTariff(product.getProductId(), StatusEnum.ACTIVE).orElse(null);
                ProductDiscount productDiscount = productDiscountRepository.findByProduct_ProductIdAndStatusWithDiscount(product.getProductId(), StatusEnum.ACTIVE).orElse(null);

                if (productTariff == null) {
                    continue;
                }

                BigDecimal price = productTariff.getTariff().getTariffPrice();
                BigDecimal discount;
                BigDecimal totalPrice;

                if (productDiscount != null) {

                    BigDecimal discountPrice = productDiscount.getDiscount().getDiscountPrice();
                    DiscountEnum discountType = productDiscount.getDiscount().getDiscountType();
                    totalPrice = calculateDiscountPrice(discountPrice, price, discountType);
                    discount = price.subtract(totalPrice);

                } else {

                    totalPrice = price;
                    discount = BigDecimal.ZERO;
                }

                AccountInvoice accountInvoice = new AccountInvoice();

                accountInvoice.setProduct(product);

                accountInvoice.setLastPaymentDate(LocalDateTime.now().plusDays(10));

                accountInvoice.setPrice(price);
                accountInvoice.setDiscount(discount);
                accountInvoice.setTotalPrice(totalPrice);
                accountInvoice.setBillingPeriod(billingPeriod);

                accountInvoiceRepository.save(accountInvoice);
            }
        }

        long duration = System.currentTimeMillis() - startTime;

        log.info("AccountInvoice customer task tamamlandı. customerId={}, durationMs={}, thread={}", customer.getCustomerId(), duration, Thread.currentThread().getName());
    }

    @Override
    public BigDecimal calculateDiscountPrice(BigDecimal discountPrice, BigDecimal price, DiscountEnum discountType) {

        if (discountPrice == null || price == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirim miktarı ve fiyat boş olamaz.");
        }

        if (discountType == null) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirim türü boş olamaz.");
        }

        if (discountType.equals(DiscountEnum.TL)) {
            return price.subtract(discountPrice);

        } else if (discountType.equals(DiscountEnum.FIXED)) {
            return discountPrice;

        } else if (discountType.equals(DiscountEnum.PERCENTAGE)) {
            return price.subtract(price.multiply(discountPrice).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        } else {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Geçersiz discount tipi. DiscountType: " + discountType);
        }
    }

    @Override
    public List<Invoice> searchInvoices(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "invoiceId",
                "totalPrice",
                "noTaxTotalPrice",
                "totalDiscountPrice",
                "noTaxTotalDiscountPrice",
                "totalTaxPrice",
                "lastPaymentDate",
                "billingPeriod",
                "createdAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "invoiceId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return invoiceRepository.searchInvoices(search, sortBy, sortDirection);
    }
}