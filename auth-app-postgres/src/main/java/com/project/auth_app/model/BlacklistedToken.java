package com.project.auth_app.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@NoArgsConstructor
@Data
@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true)
    private String token;

    private Date expirationDate;

    public BlacklistedToken(String token, Date expirationDate) {
        this.token = token;
        this.expirationDate = expirationDate;
    }

}
