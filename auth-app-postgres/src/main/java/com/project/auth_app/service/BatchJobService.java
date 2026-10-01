package com.project.auth_app.service;

import com.project.auth_app.dto.CustomerDto;
import com.project.auth_app.model.BatchJob;
import com.project.auth_app.model.BatchJobType;

import java.util.List;

public interface BatchJobService {

    BatchJob createJob(BatchJobType jobName);
    void startJob(Long jobId);
    void completeJob(Long jobId);
    void failJob(Long jobId, String errorMessage);
    BatchJob getJob(Long jobId);
    List<CustomerDto> readExcel(String filePath);
}
