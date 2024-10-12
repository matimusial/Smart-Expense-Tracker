package com.example.backendjava.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Pattern(regexp = "^(?=[a-zA-Z0-9])(?!.*[_.-]{2})(?!.*[_.-]{2})(?!.*[_.-]$)[a-zA-Z0-9._-]{3,20}$")
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Email
    @Pattern(regexp = "^[^\\s@,]+(?:\\.[^\\s@.,]+)*@[^\\s@,]+(?:\\.[^\\s@,]+)+$")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Size(min = 8)
    @Pattern(regexp = ".*[0-9!@#$%^&*].*")
    @Column(name = "password", nullable = false)
    private String password;

    @Size(min = 8)
    @Pattern(regexp = ".*[0-9!@#$%^&*].*")
    @Transient
    private String conPassword;

    @Pattern(regexp = "^[a-zA-Z]+$")
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
