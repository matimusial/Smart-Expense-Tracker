package com.example.backendjava.repositories;

import com.example.backendjava.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByConfirmationCode(Integer confirmationCode);
    Optional<User> findByEmailAndConfirmationCode(String email, Integer confirmationCode);
    void deleteByUsername(String username);
    List<User> findByIsAuthorizedFalseAndConfirmationCodeExpiryBefore(LocalDateTime currentTime);
}
