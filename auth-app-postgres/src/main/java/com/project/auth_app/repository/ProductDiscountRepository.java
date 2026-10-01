package com.project.auth_app.repository;

import com.project.auth_app.model.ProductDiscount;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductDiscountRepository extends JpaRepository<ProductDiscount, Long> {

    @Query(value = "SELECT nextval('product_discount_id_seq')", nativeQuery = true)
    Long getNextProductDiscountId();

    Optional<ProductDiscount> findByProductDiscountId(Long productDiscountId);
    List<ProductDiscount> findByProduct_ProductId(Long productId);
    List<ProductDiscount>  findByDiscount_DiscountId(Long discountId);
    List<ProductDiscount> findPassiveByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    Optional<ProductDiscount> findByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    List<ProductDiscount> findByStartDate(LocalDateTime startDate);
    List<ProductDiscount> findByEndDate(LocalDateTime endDate);
    List<ProductDiscount> findByStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<ProductDiscount> findByStatus(StatusEnum status);
    boolean existsByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    List<ProductDiscount> findByStatusAndEndDate(StatusEnum status, LocalDateTime endDate);

    @Query("""
    SELECT pd
    FROM ProductDiscount pd
    JOIN FETCH pd.discount
    WHERE pd.product.productId = :productId
      AND pd.status = :status
""")
    Optional<ProductDiscount> findByProduct_ProductIdAndStatusWithDiscount(Long productId, StatusEnum status);

    @Query(value = """
    SELECT pd.*
    FROM product_discount pd
    JOIN product p ON pd.product_id = p.product_id
    JOIN discount d ON pd.discount_id = d.discount_id
    WHERE
        (
            trim(regexp_replace(:search, '\\s+', ' ', 'g')) ~ '^[0-9]+$'
            AND cast(p.product_id AS text) = trim(regexp_replace(:search, '\\s+', ' ', 'g'))
        )
        OR
        (
            trim(regexp_replace(:search, '\\s+', ' ', 'g')) !~ '^[0-9]+$'
            AND lower(replace(coalesce(d.discount_name, ''), 'İ', 'i')) LIKE
                '%' ||
                lower(replace(trim(regexp_replace(:search, '\\s+', ' ', 'g')), 'İ', 'i')) ||
                '%'
        )
    ORDER BY
        CASE WHEN :sortBy = 'productDiscountId' AND :sortDirection = 'asc' THEN pd.product_discount_id END ASC,
        CASE WHEN :sortBy = 'productDiscountId' AND :sortDirection = 'desc' THEN pd.product_discount_id END DESC,

        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'asc' THEN d.discount_id END ASC,
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'desc' THEN d.discount_id END DESC,

        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'asc' THEN pd.start_date END ASC,
        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'desc' THEN pd.start_date END DESC,

        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'asc' THEN pd.end_date END ASC,
        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'desc' THEN pd.end_date END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN pd.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN pd.status END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN pd.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN pd.updated_at END DESC
    """, nativeQuery = true)
    List<ProductDiscount> searchProductDiscounts(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT pd.*
    FROM product_discount pd
    JOIN product p ON pd.product_id = p.product_id
    JOIN discount d ON pd.discount_id = d.discount_id
    ORDER BY
        CASE WHEN :sortBy = 'productDiscountId' AND :sortDirection = 'asc' THEN pd.product_discount_id END ASC,
        CASE WHEN :sortBy = 'productDiscountId' AND :sortDirection = 'desc' THEN pd.product_discount_id END DESC,

        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'asc' THEN d.discount_id END ASC,
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'desc' THEN d.discount_id END DESC,

        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'asc' THEN pd.start_date END ASC,
        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'desc' THEN pd.start_date END DESC,

        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'asc' THEN pd.end_date END ASC,
        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'desc' THEN pd.end_date END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN pd.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN pd.status END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN pd.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN pd.updated_at END DESC
    """, nativeQuery = true)
    List<ProductDiscount> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
