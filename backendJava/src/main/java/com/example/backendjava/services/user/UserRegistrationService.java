package com.example.backendjava.services.user;

import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.UserRepository;
import com.example.backendjava.services.EmailNotificationService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserRegistrationService {

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    private final EmailNotificationService emailNotificationService;
    private final UserRepository userRepository;

    public UserRegistrationService(EmailNotificationService emailNotificationService, UserRepository userRepository) {
        this.emailNotificationService = emailNotificationService;
        this.userRepository = userRepository;
    }

    /**
     * Registers a new user by generating a confirmation code and sending a confirmation email.
     */
    @Transactional
    public User registerUser(User user) throws MessagingException {
        Integer pinCode = generateSixDigitCode();
        user.setConfirmationCodeExpiry(generateExpiryDate(24));
        user.setConfirmationCode(pinCode);
        user.setFirstName(capitalizeFirstLetter(user.getFirstName()));
        String confirmationUrl = generateConfirmationUrl(pinCode);

        emailNotificationService.sendRegistrationConfirmationEmail(user.getEmail(), confirmationUrl, user.getFirstName());
        return user;
    }

    /**
     * Sends a password reset email to the user if they are authorized.
     */
    @Transactional
    public ResponseEntity<String> sendResetPasswordEmail(User user) {
        if (!user.getIsAuthorized()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nie można zresetować hasła. Proszę najpierw autoryzować swój profil");
        }

        Integer pinCode = generateSixDigitCode();
        user.setConfirmationCode(pinCode);
        user.setConfirmationCodeExpiry(generateExpiryDate(1));
        String resetPasswordUrl = generateResetPasswordUrl(pinCode, user.getEmail());

        try {
            userRepository.save(user);
            emailNotificationService.sendPasswordResetEmail(user.getEmail(), resetPasswordUrl, user.getFirstName());
            return ResponseEntity.ok("Link aktywacyjny został wysłany na adres: " + user.getEmail());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Wystąpił błąd podczas wysłania e-maila");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Wystąpił błąd podczas zapisu danych");
        }
    }

    private String generateConfirmationUrl(Integer pinCode) {
        return frontendBaseUrl + "/user/registration/authorize-registration?pincode=" + pinCode;
    }

    private String generateResetPasswordUrl(Integer pinCode, String email) {
        return frontendBaseUrl + "/user/login/reset-password?pincode=" + pinCode + "&email=" + email;
    }

    private int generateSixDigitCode() {
        return ThreadLocalRandom.current().nextInt(100000, 1000000);
    }

    private LocalDateTime generateExpiryDate(Integer hours) {
        return LocalDateTime.now().plusHours(hours);
    }

    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
}

