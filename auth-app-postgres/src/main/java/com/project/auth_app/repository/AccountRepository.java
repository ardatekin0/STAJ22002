package com.project.auth_app.repository;

import com.project.auth_app.model.Account;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {

    Optional<Account> findByAccountId(Long accountId);
    Optional<Account> findByCustomer_CustomerIdAndAccountName(Long customerId, String accountName);
    List<Account> findByCustomer_CustomerId(Long customerId);
    boolean existsByCustomer_CustomerIdAndAccountName(Long customerId, String accountName);
    List<Account> findByCustomer_CustomerIdAndStatus(Long customerId, StatusEnum status);
    List<Account> findByStatus(StatusEnum status);

    @Query(value = """
    SELECT a.*
    FROM account a
    JOIN customer c ON a.customer_id = c.customer_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            (
                token ~ '^[0-9]+$'
                AND lower(coalesce(a.account_name, '')) NOT LIKE '% ' || token
            )
            OR
            (
                token !~ '^[0-9]+$'
                AND lower(coalesce(a.account_name, '')) NOT LIKE '%' || token || '%'
                AND lower(coalesce(c.customer_name, '')) NOT LIKE '%' || token || '%'
                AND lower(coalesce(c.customer_last_name, '')) NOT LIKE '%' || token || '%'
            )
    )
    ORDER BY
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'asc' THEN a.account_id END ASC,
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'desc' THEN a.account_id END DESC,

        CASE WHEN :sortBy = 'accountName' AND :sortDirection = 'asc' THEN a.account_name END ASC,
        CASE WHEN :sortBy = 'accountName' AND :sortDirection = 'desc' THEN a.account_name END DESC,

        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'asc' THEN c.customer_id END ASC,
        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'desc' THEN c.customer_id END DESC,

        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'asc' THEN c.customer_name END ASC,
        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'desc' THEN c.customer_name END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN a.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN a.status END DESC,

        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'asc' THEN a.created_date END ASC,
        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'desc' THEN a.created_date END DESC
    """, nativeQuery = true)
    List<Account> searchAccounts(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT a.*
    FROM account a
    JOIN customer c ON a.customer_id = c.customer_id
    ORDER BY
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'asc' THEN a.account_id END ASC,
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'desc' THEN a.account_id END DESC,

        CASE WHEN :sortBy = 'accountName' AND :sortDirection = 'asc' THEN a.account_name END ASC,
        CASE WHEN :sortBy = 'accountName' AND :sortDirection = 'desc' THEN a.account_name END DESC,

        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'asc' THEN c.customer_id END ASC,
        CASE WHEN :sortBy = 'customerId' AND :sortDirection = 'desc' THEN c.customer_id END DESC,

        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'asc' THEN c.customer_name END ASC,
        CASE WHEN :sortBy = 'customerName' AND :sortDirection = 'desc' THEN c.customer_name END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN a.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN a.status END DESC,

        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'asc' THEN a.created_date END ASC,
        CASE WHEN :sortBy = 'createdDate' AND :sortDirection = 'desc' THEN a.created_date END DESC
    """, nativeQuery = true)
    List<Account> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
