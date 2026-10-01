package com.project.auth_app.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "roller")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String ad;
    private String aciklama;
}
