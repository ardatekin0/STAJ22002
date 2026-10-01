package com.project.auth_app.repository;

import com.project.auth_app.model.Product;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByAccount_AccountId(Long accountId);
    List<Product> findByStatus(StatusEnum status);
    List<Product> findByAccount_AccountIdAndStatus(Long accountId, StatusEnum status);
    Optional<Product> findByProductId(Long productId);
    boolean existsByAccount_AccountIdAndProductId(Long accountId, Long productId);

    @Query(value = """
    SELECT p.*
    FROM product p
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            cast(p.product_id AS text) NOT LIKE '%' || token || '%'
            AND cast(p.account_id AS text) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'asc' THEN p.account_id END ASC,
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'desc' THEN p.account_id END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN p.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN p.status END DESC,

        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'asc' THEN p.created_at END ASC,
        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'desc' THEN p.created_at END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN p.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN p.updated_at END DESC
    """, nativeQuery = true)
    List<Product> searchProducts(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT p.*
    FROM product p
    ORDER BY
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'asc' THEN p.account_id END ASC,
        CASE WHEN :sortBy = 'accountId' AND :sortDirection = 'desc' THEN p.account_id END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN p.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN p.status END DESC,

        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'asc' THEN p.created_at END ASC,
        CASE WHEN :sortBy = 'createdAt' AND :sortDirection = 'desc' THEN p.created_at END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN p.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN p.updated_at END DESC
    """, nativeQuery = true)
    List<Product> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
