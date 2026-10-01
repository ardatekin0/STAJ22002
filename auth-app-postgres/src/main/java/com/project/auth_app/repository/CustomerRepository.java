package com.project.auth_app.repository;

import com.project.auth_app.model.Customer;
import com.project.auth_app.model.CustomerEnum;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerId(Long customerId);
    Optional<Customer> findByTckn(String tckn);
    Optional<Customer> findByVkn(String vkn);
    List<Customer> findByStatus(StatusEnum status);
    List<Customer> findByCustomerType(CustomerEnum customerType);
    boolean existsByTckn(String tckn);
    boolean existsByVkn(String vkn);

    @Query(value = """
    SELECT c.*
    FROM customer c
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            lower(coalesce(c.customer_name, '')) NOT LIKE '%' || token || '%'
            AND lower(coalesce(c.customer_last_name, '')) NOT LIKE '%' || token || '%'
            AND cast(c.customer_id AS text) NOT LIKE '%' || token || '%'
            AND coalesce(c.tckn, '') NOT LIKE '%' || token || '%'
            AND coalesce(c.vkn, '') NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'customer_id' AND :sortDirection = 'asc' THEN c.customer_id END ASC,
        CASE WHEN :sortBy = 'customer_id' AND :sortDirection = 'desc' THEN c.customer_id END DESC,
        CASE WHEN :sortBy = 'customer_name' AND :sortDirection = 'asc' THEN c.customer_name END ASC,
        CASE WHEN :sortBy = 'customer_name' AND :sortDirection = 'desc' THEN c.customer_name END DESC,
        CASE WHEN :sortBy = 'customer_last_name' AND :sortDirection = 'asc' THEN c.customer_last_name END ASC,
        CASE WHEN :sortBy = 'customer_last_name' AND :sortDirection = 'desc' THEN c.customer_last_name END DESC,
        CASE WHEN :sortBy = 'customer_id' AND :sortDirection = 'asc' THEN c.customer_id END ASC
    """, nativeQuery = true)
    List<Customer> searchCustomers(
            @Param("search") String search,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection
    );

    @Query(value = """
    SELECT c.*
    FROM customer c
    ORDER BY
        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'asc' THEN c.customer_id END ASC,
        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'desc' THEN c.customer_id END DESC,
        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'asc' THEN c.customer_name END ASC,
        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'desc' THEN c.customer_name END DESC,
        CASE WHEN :sortBy = 'customerType' AND :sortDirection = 'asc' THEN c.customer_type END ASC,
        CASE WHEN :sortBy = 'customerType' AND :sortDirection = 'desc' THEN c.customer_type END DESC,
        CASE WHEN :sortBy = 'tcknVkn' AND :sortDirection = 'asc' THEN COALESCE(c.tckn, c.vkn) END ASC,
        CASE WHEN :sortBy = 'tcknVkn' AND :sortDirection = 'desc' THEN COALESCE(c.tckn, c.vkn) END DESC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN c.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN c.status END DESC,
        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'asc' THEN c.created_date END ASC,
        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'desc' THEN c.created_date END DESC
    """, nativeQuery = true)
    List<Customer> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
