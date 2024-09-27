package com.example.backendjava.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Pattern(
            regexp = "^[a-z0-9._-]+$",
            message = "Nazwa użytkownika może zawierać tylko małe litery, cyfry, kropki, podkreślenia i myślniki"
    )
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Email(message = "To nie jest prawidłowy adres email")
    @Pattern(
            regexp = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
            message = "To nie jest prawidłowy adres email"
    )
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$",
            message = "Hasło musi mieć co najmniej 6 znaków, zawierać co najmniej jedną małą literę, jedną dużą literę i jedną cyfrę"
    )
    @Column(name = "password", nullable = false)
    private String password;

    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$",
            message = "Potwierdzenie hasła musi spełniać te same kryteria co hasło"
    )
    @Transient
    private String conPassword;

    @Pattern(
            regexp = "^[a-zA-Z]+$",
            message = "Imię może zawierać tylko litery"
    )
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "confirmation_code")
    private Integer confirmationCode;

    @Column(name = "confirmation_code_expiry")
    private LocalDateTime confirmationCodeExpiry;

    @Column(name = "is_authorized", nullable = false)
    private Boolean isAuthorized = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConPassword() {
        return conPassword;
    }

    public void setConPassword(String conPassword) {
        this.conPassword = conPassword;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public Integer getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(Integer confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public LocalDateTime getConfirmationCodeExpiry() {
        return confirmationCodeExpiry;
    }

    public void setConfirmationCodeExpiry(LocalDateTime confirmationCodeExpiry) {
        this.confirmationCodeExpiry = confirmationCodeExpiry;
    }

    public Boolean getIsAuthorized() {
        return isAuthorized;
    }

    public void setIsAuthorized(Boolean isAuthorized) {
        this.isAuthorized = isAuthorized;
    }
}
