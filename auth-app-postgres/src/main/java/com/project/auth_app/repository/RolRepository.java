package com.project.auth_app.repository;

import com.project.auth_app.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, String> {

    Optional<Rol> findByAd(String ad);
    boolean existsByAd(String ad);

    @Query(value = """
    SELECT *
    FROM roller
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            translate(
                lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
                'ğüşıöçĞÜŞİÖÇ',
                'gusiocgusioc'
            ),
            ' '
        ) AS token
        WHERE
            translate(
                lower(coalesce(ad, '')),
                'ğüşıöçĞÜŞİÖÇ',
                'gusiocgusioc'
            ) NOT LIKE '%' || token || '%'
            AND
            translate(
                lower(coalesce(aciklama, '')),
                'ğüşıöçĞÜŞİÖÇ',
                'gusiocgusioc'
            ) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'id' AND :sortDirection = 'asc' THEN id END ASC,
        CASE WHEN :sortBy = 'id' AND :sortDirection = 'desc' THEN id END DESC,
        CASE WHEN :sortBy = 'ad' AND :sortDirection = 'asc' THEN ad END ASC,
        CASE WHEN :sortBy = 'ad' AND :sortDirection = 'desc' THEN ad END DESC,
        CASE WHEN :sortBy = 'aciklama' AND :sortDirection = 'asc' THEN aciklama END ASC,
        CASE WHEN :sortBy = 'aciklama' AND :sortDirection = 'desc' THEN aciklama END DESC
    """, nativeQuery = true)
    List<Rol> searchRoller(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
        SELECT *
        FROM roller
        ORDER BY
            CASE WHEN :sortBy = 'id' AND :sortDirection = 'asc' THEN id END ASC,
            CASE WHEN :sortBy = 'id' AND :sortDirection = 'desc' THEN id END DESC,
            CASE WHEN :sortBy = 'ad' AND :sortDirection = 'asc' THEN ad END ASC,
            CASE WHEN :sortBy = 'ad' AND :sortDirection = 'desc' THEN ad END DESC,
            CASE WHEN :sortBy = 'aciklama' AND :sortDirection = 'asc' THEN aciklama END ASC,
            CASE WHEN :sortBy = 'aciklama' AND :sortDirection = 'desc' THEN aciklama END DESC
        """, nativeQuery = true)
    List<Rol> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}