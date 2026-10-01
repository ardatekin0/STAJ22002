package com.project.auth_app.serviceImpl;

import com.project.auth_app.dto.CustomerDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Customer;
import com.project.auth_app.model.CustomerEnum;
import com.project.auth_app.service.BatchJobService;
import com.project.auth_app.service.BatchService;
import com.project.auth_app.service.ValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Service
public class BatchServiceImpl implements BatchService {

    private final JdbcTemplate jdbcTemplate;
    private final BatchJobService batchJobService;
    private final Executor taskExecutor;
    private final ValidationService validationService;

    public BatchServiceImpl(JdbcTemplate jdbcTemplate, BatchJobService batchJobService, Executor taskExecutor, ValidationService validationService) {
        this.jdbcTemplate = jdbcTemplate;
        this.batchJobService = batchJobService;
        this.taskExecutor = taskExecutor;
        this.validationService = validationService;
    }

    @Override
    @Async("taskExecutor")
    public void processBatchAsync(Long jobId, String filePath) {

        File tempFile = new File(filePath);

        long startTime = System.currentTimeMillis();

        log.info("Customer batch başladı. jobId={}, thread={}, filePath={}", jobId, Thread.currentThread().getName(), filePath);

        try {

            batchJobService.startJob(jobId);

            List<CustomerDto> customerDtoList = batchJobService.readExcel(filePath);

            log.info("Excel okundu. jobId={}, customerCount={}, thread={}", jobId, customerDtoList.size(), Thread.currentThread().getName());

            validateCustomers(customerDtoList);

            List<List<CustomerDto>> partitions = partition(customerDtoList, 1000);

            log.info("Customer listesi task'lara bölündü. jobId={}, totalCustomer={}, taskCount={}, batchSize={}", jobId, customerDtoList.size(), partitions.size(), 1000);

            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (int i = 0; i < partitions.size(); i++) {

                int taskNumber = i + 1;
                List<CustomerDto> partition = partitions.get(i);

                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> processBatchTask(jobId, taskNumber, partition), taskExecutor);

                futures.add(future);
            }

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            batchJobService.completeJob(jobId);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Customer batch tamamlandı. jobId={}, customerCount={}, taskCount={}, durationMs={}, thread={}", jobId, customerDtoList.size(), partitions.size(), duration, Thread.currentThread().getName());

        } catch (Exception e) {

            log.error("Customer batch başarısız. jobId={}, error={}, thread={}", jobId, e.getMessage(), Thread.currentThread().getName(), e);

            batchJobService.failJob(jobId, e.getMessage());

        } finally {

            if (tempFile.exists()) {
                tempFile.delete();
            }

            log.info("Customer batch geçici dosyası temizlendi. jobId={}, thread={}", jobId, Thread.currentThread().getName());
        }
    }

    private void processBatchTask(Long jobId, int taskNumber, List<CustomerDto> customerDtoList) {

        long startTime = System.currentTimeMillis();

        log.info("Customer task başladı. jobId={}, taskNumber={}, customerCount={}, thread={}", jobId, taskNumber, customerDtoList.size(), Thread.currentThread().getName());

        String[] customerNames = new String[customerDtoList.size()];
        String[] customerLastNames = new String[customerDtoList.size()];
        String[] customerTypes = new String[customerDtoList.size()];
        String[] tckns = new String[customerDtoList.size()];
        String[] vkns = new String[customerDtoList.size()];

        for (int i = 0; i < customerDtoList.size(); i++) {

            Customer customer = customerDtoList.get(i).getCustomer();

            customerNames[i] = customer.getCustomerName();
            customerLastNames[i] = customer.getCustomerLastName();
            customerTypes[i] = customer.getCustomerType().name();
            tckns[i] = customer.getTckn();
            vkns[i] = customer.getVkn();
        }

        jdbcTemplate.update(connection -> {

            java.sql.CallableStatement statement = connection.prepareCall("CALL insert_customers_bulk(?, ?, ?, ?, ?)");

            statement.setArray(1, connection.createArrayOf("text", customerNames));
            statement.setArray(2, connection.createArrayOf("text", customerLastNames));
            statement.setArray(3, connection.createArrayOf("text", customerTypes));
            statement.setArray(4, connection.createArrayOf("text", tckns));
            statement.setArray(5, connection.createArrayOf("text", vkns));

            return statement;
        });

        long duration = System.currentTimeMillis() - startTime;

        log.info("Customer task tamamlandı. jobId={}, taskNumber={}, customerCount={}, durationMs={}, thread={}", jobId, taskNumber, customerDtoList.size(), duration, Thread.currentThread().getName());
    }

    private void validateCustomers(List<CustomerDto> customerDtoList) {

        Set<String> tcknSet = new HashSet<>();
        Set<String> vknSet = new HashSet<>();

        for (CustomerDto customerDto : customerDtoList) {

            Customer customer = customerDto.getCustomer();

            if (customer == null) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Excel içerisindeki customer verisi boş olamaz.");
            }

            validationService.createCustomerValid(customer);

            if (customer.getCustomerType() == CustomerEnum.INDIVIDUAL) {
                if (!tcknSet.add(customer.getTckn())) {
                    throw new GenericException(HttpStatus.BAD_REQUEST, "Excel içerisinde aynı TCKN birden fazla kez bulunmaktadır. TCKN: " + customer.getTckn());
                }
            } else if (customer.getCustomerType() == CustomerEnum.CORPORATE) {
                if (!vknSet.add(customer.getVkn())) {
                    throw new GenericException(HttpStatus.BAD_REQUEST, "Excel içerisinde aynı VKN birden fazla kez bulunmaktadır. VKN: " + customer.getVkn());
                }
            }
        }
    }


    private List<List<CustomerDto>> partition(List<CustomerDto> customerDtoList, int batchSize) {

        List<List<CustomerDto>> partitions = new ArrayList<>();

        for (int i = 0; i < customerDtoList.size(); i += batchSize) {
            partitions.add(new ArrayList<>(customerDtoList.subList(i, Math.min(i + batchSize, customerDtoList.size()))));
        }

        return partitions;
    }

    @Override
    public void processBatch(List<CustomerDto> customerDtoList) {

        if (customerDtoList == null ||
                customerDtoList.isEmpty()) {
            return;
        }

        validateCustomers(customerDtoList);

        processBatchTask(null, 1, customerDtoList);
    }
}