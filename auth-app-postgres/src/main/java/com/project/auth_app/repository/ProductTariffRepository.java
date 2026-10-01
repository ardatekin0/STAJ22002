package com.project.auth_app.repository;

import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTariffRepository extends JpaRepository<ProductTariff, Long> {


    @Query(value = "SELECT nextval('public.product_tariff_id_seq')", nativeQuery = true)
    Long getNextProductTariffId();

    Optional<ProductTariff> findByProductTariffId(Long productTariffId);
    List<ProductTariff> findByProduct_ProductId(Long productId);
    List<ProductTariff> findByTariff_TariffId(Long tariffId);
    List<ProductTariff> findPassiveByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    Optional<ProductTariff> findByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    List<ProductTariff> findByStartDate(LocalDateTime startDate);
    List<ProductTariff> findByStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<ProductTariff> findByEndDate(LocalDateTime endDate);
    List<ProductTariff> findByStatus(StatusEnum status);
    boolean existsByProduct_ProductIdAndStatus(Long productId, StatusEnum status);
    List<ProductTariff> findByStatusAndEndDateBefore(StatusEnum status, LocalDateTime now);

    @Query("""
    SELECT pt
    FROM ProductTariff pt
    JOIN FETCH pt.tariff
    WHERE pt.product.productId = :productId
      AND pt.status = :status
""")
    Optional<ProductTariff> findByProduct_ProductIdAndStatusWithTariff(Long productId, StatusEnum status);

    @Query(value = """
    SELECT pt.*
    FROM product_tariff pt
    JOIN product p ON pt.product_id = p.product_id
    JOIN tariff t ON pt.tariff_id = t.tariff_id
    WHERE
        (
            trim(regexp_replace(:search, '\\s+', ' ', 'g')) ~ '^[0-9]+$'
            AND cast(p.product_id AS text) = trim(regexp_replace(:search, '\\s+', ' ', 'g'))
        )
        OR
        (
            trim(regexp_replace(:search, '\\s+', ' ', 'g')) !~ '^[0-9]+$'
            AND NOT EXISTS (
                SELECT 1
                FROM regexp_split_to_table(
                    lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
                    ' '
                ) AS token
                WHERE lower(coalesce(t.tariff_name, '')) NOT LIKE '%' || token || '%'
            )
        )
    ORDER BY
        CASE WHEN :sortBy = 'productTariffId' AND :sortDirection = 'asc' THEN pt.product_tariff_id END ASC,
        CASE WHEN :sortBy = 'productTariffId' AND :sortDirection = 'desc' THEN pt.product_tariff_id END DESC,

        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'asc' THEN t.tariff_id END ASC,
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'desc' THEN t.tariff_id END DESC,

        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'asc' THEN pt.start_date END ASC,
        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'desc' THEN pt.start_date END DESC,

        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'asc' THEN pt.end_date END ASC,
        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'desc' THEN pt.end_date END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN pt.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN pt.status END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN pt.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN pt.updated_at END DESC
    """, nativeQuery = true)
    List<ProductTariff> searchProductTariffs(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT pt.*
    FROM product_tariff pt
    JOIN product p ON pt.product_id = p.product_id
    JOIN tariff t ON pt.tariff_id = t.tariff_id
    ORDER BY
        CASE WHEN :sortBy = 'productTariffId' AND :sortDirection = 'asc' THEN pt.product_tariff_id END ASC,
        CASE WHEN :sortBy = 'productTariffId' AND :sortDirection = 'desc' THEN pt.product_tariff_id END DESC,

        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'asc' THEN p.product_id END ASC,
        CASE WHEN :sortBy = 'productId' AND :sortDirection = 'desc' THEN p.product_id END DESC,

        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'asc' THEN t.tariff_id END ASC,
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'desc' THEN t.tariff_id END DESC,

        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'asc' THEN pt.start_date END ASC,
        CASE WHEN :sortBy = 'startDate' AND :sortDirection = 'desc' THEN pt.start_date END DESC,

        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'asc' THEN pt.end_date END ASC,
        CASE WHEN :sortBy = 'endDate' AND :sortDirection = 'desc' THEN pt.end_date END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN pt.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN pt.status END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN pt.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN pt.updated_at END DESC
    """, nativeQuery = true)
    List<ProductTariff> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
