package com.project.auth_app.repository;

import com.project.auth_app.model.Kullanici;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KullaniciRepository extends JpaRepository<Kullanici, String> {

    Optional<Kullanici> findByKullaniciAdi(String kullaniciAdi);
    boolean existsByePosta(String ePosta);
    boolean existsByKullaniciAdi(String kullaniciAdi);
    void deleteByKullaniciAdi(String kullaniciAdi);
    Optional<Kullanici> findByePosta(String ePosta);

    @Query(value = """
            SELECT *
            FROM kullanici
            WHERE roller @> CAST(:rol AS jsonb)
            """, nativeQuery = true)
    List<Kullanici> findByRollerContaining(@Param("rol") String rol);

    @Query(value = """
    SELECT *
    FROM kullanici
    WHERE NOT EXISTS (
        SELECT 1
        FROM regexp_split_to_table(
            lower(trim(regexp_replace(:search, '\\s+', ' ', 'g'))),
            ' '
        ) AS token
        WHERE
            lower(coalesce(kullanici_adi, '')) NOT LIKE '%' || token || '%'
            AND lower(coalesce(e_posta, '')) NOT LIKE '%' || token || '%'
            AND lower(coalesce(roller::text, '')) NOT LIKE '%' || token || '%'
    )
    ORDER BY
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'asc' THEN kullanici_adi END ASC,
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'desc' THEN kullanici_adi END DESC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'asc' THEN e_posta END ASC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'desc' THEN e_posta END DESC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN status END DESC
    """, nativeQuery = true)
    List<Kullanici> searchKullanicilar(@Param("search") String search, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);


    @Query(value = """
    SELECT *
    FROM kullanici
    ORDER BY
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'asc' THEN kullanici_adi END ASC,
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'desc' THEN kullanici_adi END DESC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'asc' THEN e_posta END ASC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'desc' THEN e_posta END DESC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN status END DESC
    """, nativeQuery = true)
    List<Kullanici> findByRollerContaining(@Param("rol") String rol, @Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);

    @Query(value = """
    SELECT *
    FROM kullanici
    ORDER BY
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'asc' THEN kullanici_adi END ASC,
        CASE WHEN :sortBy = 'kullaniciAdi' AND :sortDirection = 'desc' THEN kullanici_adi END DESC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'asc' THEN e_posta END ASC,
        CASE WHEN :sortBy = 'ePosta' AND :sortDirection = 'desc' THEN e_posta END DESC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'asc' THEN status END ASC,
        CASE WHEN :sortBy = 'status' AND :sortDirection = 'desc' THEN status END DESC
    """, nativeQuery = true)
    List<Kullanici> findAllSorted(@Param("sortBy") String sortBy, @Param("sortDirection") String sortDirection);
}
