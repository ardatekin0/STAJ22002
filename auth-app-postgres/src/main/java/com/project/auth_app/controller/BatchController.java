package com.project.auth_app.controller;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.BatchJob;
import com.project.auth_app.model.BatchJobType;
import com.project.auth_app.service.BatchJobService;
import com.project.auth_app.service.BatchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/api/batch")
@PreAuthorize("hasAuthority('ROLE_TELEKOM')")
public class BatchController {

    private final BatchJobService batchJobService;
    private final BatchService batchService;

    public BatchController(BatchJobService batchJobService, BatchService batchService) {
        this.batchJobService = batchJobService;
        this.batchService = batchService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "Excel dosyası boş olamaz.");
        }

        BatchJob batchJob = batchJobService.createJob(BatchJobType.CUSTOMER_BATCH);
        File tempFile = null;

        try {
            tempFile = File.createTempFile("batch-", ".xlsx");
            file.transferTo(tempFile);
            batchService.processBatchAsync(batchJob.getId(), tempFile.getAbsolutePath());
            return ResponseEntity.ok("Batch işlemi kuyruğa alındı. Job Id: " + batchJob.getId());

        } catch (Exception e) {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }

            batchJobService.failJob(batchJob.getId(), e.getMessage());
            throw new GenericException(HttpStatus.BAD_REQUEST, "Batch işlemi başlatılamadı! " + e.getMessage());
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(batchJobService.getJob(jobId));
    }
}