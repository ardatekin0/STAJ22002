package com.project.auth_app.repository;

import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.model.Tariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {

    Optional<Tariff> findByTariffName(String tariffName);
    Optional<Tariff> findByTariffCode(Integer tariffCode);
    List<Tariff> findByTariffPrice(BigDecimal tariffPrice);
    boolean existsByTariffCode(Integer tariffCode);
    List<Tariff> findByStatus(StatusEnum status);

    @Query("SELECT MAX(t.tariffCode) FROM Tariff t")
    Optional<Integer> findMaxTariffCode();

    @Query(value = """
    SELECT t.*
    FROM tariff t
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            cast(t.tariff_code AS text) NOT LIKE '%' || token || '%'
            AND lower(coalesce(t.tariff_name, '')) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'asc' THEN t.tariff_id END ASC,
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'desc' THEN t.tariff_id END DESC,

        CASE WHEN :sortBy = 'tariffName' AND :sortDirection = 'asc' THEN t.tariff_name END ASC,
        CASE WHEN :sortBy = 'tariffName' AND :sortDirection = 'desc' THEN t.tariff_name END DESC,

        CASE WHEN :sortBy = 'tariffPrice' AND :sortDirection = 'asc' THEN t.tariff_price END ASC,
        CASE WHEN :sortBy = 'tariffPrice' AND :sortDirection = 'desc' THEN t.tariff_price END DESC,

        CASE WHEN :sortBy = 'tariffCode' AND :sortDirection = 'asc' THEN t.tariff_code END ASC,
        CASE WHEN :sortBy = 'tariffCode' AND :sortDirection = 'desc' THEN t.tariff_code END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN t.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN t.status END DESC,

        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'asc' THEN t.validity_start_date END ASC,
        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'desc' THEN t.validity_start_date END DESC,

        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'asc' THEN t.validity_end_date END ASC,
        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'desc' THEN t.validity_end_date END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN t.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN t.updated_at END DESC
    """, nativeQuery = true)
    List<Tariff> searchTariffs(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT t.*
    FROM tariff t
    ORDER BY
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'asc' THEN t.tariff_id END ASC,
        CASE WHEN :sortBy = 'tariffId' AND :sortDirection = 'desc' THEN t.tariff_id END DESC,

        CASE WHEN :sortBy = 'tariffName' AND :sortDirection = 'asc' THEN t.tariff_name END ASC,
        CASE WHEN :sortBy = 'tariffName' AND :sortDirection = 'desc' THEN t.tariff_name END DESC,

        CASE WHEN :sortBy = 'tariffPrice' AND :sortDirection = 'asc' THEN t.tariff_price END ASC,
        CASE WHEN :sortBy = 'tariffPrice' AND :sortDirection = 'desc' THEN t.tariff_price END DESC,

        CASE WHEN :sortBy = 'tariffCode' AND :sortDirection = 'asc' THEN t.tariff_code END ASC,
        CASE WHEN :sortBy = 'tariffCode' AND :sortDirection = 'desc' THEN t.tariff_code END DESC,

        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN t.status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN t.status END DESC,

        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'asc' THEN t.validity_start_date END ASC,
        CASE WHEN :sortBy = 'validityStartDate' AND :sortDirection = 'desc' THEN t.validity_start_date END DESC,

        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'asc' THEN t.validity_end_date END ASC,
        CASE WHEN :sortBy = 'validityEndDate' AND :sortDirection = 'desc' THEN t.validity_end_date END DESC,

        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'asc' THEN t.updated_at END ASC,
        CASE WHEN :sortBy = 'updatedAt' AND :sortDirection = 'desc' THEN t.updated_at END DESC
    """, nativeQuery = true)
    List<Tariff> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}