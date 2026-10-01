package com.project.auth_app.repository;

import com.project.auth_app.model.Discount;
import com.project.auth_app.model.DiscountEnum;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    Optional<Discount> findByDiscountName(String discountName);
    Optional<Discount> findByDiscountCode(Integer discountCode);
    List<Discount> findByDiscountPrice(BigDecimal discountPrice);
    List<Discount> findByDiscountType(DiscountEnum discountType);
    boolean existsByDiscountCode(Integer discountCode);
    List<Discount> findByStatus(StatusEnum status);

    @Query("SELECT MAX(d.discountCode) FROM Discount d")
    Optional<Integer> findMaxDiscountCode();

    @Query(value = """
    SELECT d.*
    FROM discount d
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            cast(d.discount_code AS text) NOT LIKE '%' || token || '%'
            AND lower(coalesce(d.discount_name, '')) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'asc' THEN d.discount_id END ASC,
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'desc' THEN d.discount_id END DESC,

        CASE WHEN :sortBy = 'discountName' AND :sortDirection = 'asc' THEN d.discount_name END ASC,
        CASE WHEN :sortBy = 'discountName' AND :sortDirection = 'desc' THEN d.discount_name END DESC,

        CASE WHEN :sortBy = 'discountCode' AND :sortDirection = 'asc' THEN d.discount_code END ASC,
        CASE WHEN :sortBy = 'discountCode' AND :sortDirection = 'desc' THEN d.discount_code END DESC,

        CASE WHEN :sortBy = 'discountType' AND :sortDirection = 'asc' THEN d.discount_type END ASC,
        CASE WHEN :sortBy = 'discountType' AND :sortDirection = 'desc' THEN d.discount_type END DESC,

        CASE WHEN :sortBy = 'discountPrice' AND :sortDirection = 'asc' THEN d.discount_price END ASC,
        CASE WHEN :sortBy = 'discountPrice' AND :sortDirection = 'desc' THEN d.discount_price END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN d.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN d.status END DESC,

        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'asc' THEN d.validity_start_date END ASC,
        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'desc' THEN d.validity_start_date END DESC,

        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'asc' THEN d.validity_end_date END ASC,
        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'desc' THEN d.validity_end_date END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN d.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN d.updated_at END DESC
    """, nativeQuery = true)
    List<Discount> searchDiscounts(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT d.*
    FROM discount d
    ORDER BY
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'asc' THEN d.discount_id END ASC,
        CASE WHEN :sortBy = 'discountId' AND :sortDirection = 'desc' THEN d.discount_id END DESC,

        CASE WHEN :sortBy = 'discountName' AND :sortDirection = 'asc' THEN d.discount_name END ASC,
        CASE WHEN :sortBy = 'discountName' AND :sortDirection = 'desc' THEN d.discount_name END DESC,

        CASE WHEN :sortBy = 'discountCode' AND :sortDirection = 'asc' THEN d.discount_code END ASC,
        CASE WHEN :sortBy = 'discountCode' AND :sortDirection = 'desc' THEN d.discount_code END DESC,

        CASE WHEN :sortBy = 'discountType' AND :sortDirection = 'asc' THEN d.discount_type END ASC,
        CASE WHEN :sortBy = 'discountType' AND :sortDirection = 'desc' THEN d.discount_type END DESC,

        CASE WHEN :sortBy = 'discountPrice' AND :sortDirection = 'asc' THEN d.discount_price END ASC,
        CASE WHEN :sortBy = 'discountPrice' AND :sortDirection = 'desc' THEN d.discount_price END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN d.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN d.status END DESC,

        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'asc' THEN d.validity_start_date END ASC,
        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'desc' THEN d.validity_start_date END DESC,

        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'asc' THEN d.validity_end_date END ASC,
        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'desc' THEN d.validity_end_date END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN d.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN d.updated_at END DESC
    """, nativeQuery = true)
    List<Discount> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}