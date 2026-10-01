package com.project.auth_app.serviceImpl;

import com.project.auth_app.dto.CustomerDto;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.*;
import com.project.auth_app.repository.BatchJobRepository;
import com.project.auth_app.service.BatchJobService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BatchJobServiceImpl implements BatchJobService {

    private final BatchJobRepository batchJobRepository;

    public BatchJobServiceImpl(BatchJobRepository batchJobRepository) {
        this.batchJobRepository = batchJobRepository;
    }

    @Override
    public BatchJob createJob(BatchJobType jobName) {

        BatchJob batchJob = new BatchJob();

        batchJob.setBatchJobType(jobName);
        batchJob.setJobStatus(BatchJobStatus.QUEUED);
        batchJob.setCreatedAt(LocalDateTime.now());

        return batchJobRepository.save(batchJob);
    }

    @Override
    public void startJob(Long jobId) {

        BatchJob batchJob = getJob(jobId);

        batchJob.setJobStatus(BatchJobStatus.PROCESSING);
        batchJob.setStartedAt(LocalDateTime.now());

        batchJobRepository.save(batchJob);
    }

    @Override
    public void completeJob(Long jobId) {

        BatchJob batchJob = getJob(jobId);

        batchJob.setJobStatus(BatchJobStatus.COMPLETED);
        batchJob.setCompletedAt(LocalDateTime.now());

        batchJobRepository.save(batchJob);
    }

    @Override
    public void failJob(Long jobId, String errorMessage) {

        BatchJob batchJob = getJob(jobId);

        batchJob.setJobStatus(BatchJobStatus.FAILED);
        batchJob.setErrorMessage(errorMessage);
        batchJob.setCompletedAt(LocalDateTime.now());

        batchJobRepository.save(batchJob);
    }

    @Override
    public BatchJob getJob(Long jobId) {
        return batchJobRepository.findById(jobId).orElseThrow(() -> new GenericException(HttpStatus.NOT_FOUND, "Job Id bulunamadı.Job Id: " + jobId));
    }

    @Override
    public List<CustomerDto> readExcel(String filePath) {

        List<CustomerDto> customerDtoList = new ArrayList<>();

        try (
                FileInputStream fileInputStream = new FileInputStream(filePath);
                Workbook workbook = WorkbookFactory.create(fileInputStream)
        ) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                throw new GenericException(HttpStatus.BAD_REQUEST, "Excel dosyası boş. Lütfen müşteri bilgilerini ve gerekli başlıkları içeren bir Excel dosyası yükleyin.");
            }

            Map<String, Integer> columnMap = new HashMap<>();

            for (Cell cell : headerRow) {
                if (cell.getCellType() == CellType.STRING) {

                    String columnName = cell.getStringCellValue().trim();

                    if (!columnName.isEmpty()) {
                        columnMap.put(columnName, cell.getColumnIndex());
                    }
                }
            }
            List<String> requiredColumns = List.of("customerName", "customerLastName", "customerType", "tckn", "vkn");

            for (String requiredColumn : requiredColumns) {
                if (!columnMap.containsKey(requiredColumn)) {
                    throw new GenericException(HttpStatus.BAD_REQUEST, "Excel dosyasında gerekli başlık bulunamadı: " + requiredColumn);
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                Customer customer = new Customer();

                customer.setCustomerName(getCellValue(row, columnMap, "customerName"));
                customer.setCustomerLastName(getCellValue(row, columnMap, "customerLastName"));

                String customerType = getCellValue(row, columnMap, "customerType");

                if (customerType != null && !customerType.isBlank()) {
                    try {
                        customer.setCustomerType(CustomerEnum.valueOf(customerType.trim().toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        throw new GenericException(HttpStatus.BAD_REQUEST, "Excel içerisinde geçersiz müşteri tipi bulunmaktadır: " + customerType);
                    }
                }

                customer.setTckn(getCellValue(row, columnMap, "tckn"));
                customer.setVkn(getCellValue(row, columnMap, "vkn"));

                CustomerDto customerDto = new CustomerDto();
                customerDto.setCustomer(customer);

                customerDtoList.add(customerDto);
            }

        } catch (IOException e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Excel dosyası okunamadı. " + e.getMessage());
        }
        return customerDtoList;
    }

    private String getCellValue(Row row, Map<String, Integer> columnMap, String columnName) {

        Integer columnIndex = columnMap.get(columnName);

        if (columnIndex == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);

        if (cell == null) {
            return null;
        }

        DataFormatter dataFormatter = new DataFormatter();

        String value = dataFormatter.formatCellValue(cell);

        return value != null ? value.trim() : null;
    }
}