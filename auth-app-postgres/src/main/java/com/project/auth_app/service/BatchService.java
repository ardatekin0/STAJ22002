package com.project.auth_app.service;

import com.project.auth_app.dto.CustomerDto;

import java.util.List;


public interface BatchService {
    void processBatch(List<CustomerDto> customerDtoList);
    void processBatchAsync(Long jobId, String filePath);
}
