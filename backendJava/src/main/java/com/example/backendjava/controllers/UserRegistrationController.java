package com.example.backendjava.controllers;

import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.UserRepository;
import com.example.backendjava.services.EmailNotificationService;
import com.example.backendjava.services.user.UserRegistrationService;
import com.example.backendjava.utils.BcryptUtil;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/spring-api/user")
public class UserRegistrationController {

    private final UserRegistrationService userRegistrationService;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    private static final String ANONYMOUS_USER = "anonymousUser";

    @Autowired
    public UserRegistrationController(UserRegistrationService userRegistrationService, UserRepository userRepository,
                                      EmailNotificationService emailNotificationService) {
        this.userRegistrationService = userRegistrationService;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
    }

    /**
     * Authorizes the user registration using the provided pincode.
     */
    @GetMapping("/authorize-registration/{pincode}")
    public ResponseEntity<String> authorizeRegistration(@PathVariable String pincode) {
        Optional<User> userOpt = userRepository.findByConfirmationCode(Integer.valueOf(pincode));

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.GONE).body("Link aktywacyjny wygasł");
        }

        User user = userOpt.get();
        user.setIsAuthorized(true);
        user.setConfirmationCodeExpiry(null);
        user.setConfirmationCode(null);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Wystąpił błąd. Spróbuj ponownie później");
        }
        return ResponseEntity.ok("Autoryzacja przebiegła pomyślnie");
    }

    /**
     * Sends a password reset email to the user.
     */
    @Transactional
    @PostMapping("/forgot-password")
    public ResponseEntity<String> sendPasswordResetEmail(@RequestBody Map<String, String> emailJson) {
        String email = emailJson.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            try {
                /**
                 * Possible HTTP Status Codes:
                 * - 200 OK: Link aktywacyjny został wysłany na adres:,
                 * - 409 CONFLICT: Nie można zresetować hasła. Proszę najpierw autoryzować swój profil,
                 * - 500 INTERNAL SERVER ERROR: Wystąpił błąd podczas wysyłania e-maila,
                 * - 500 INTERNAL SERVER ERROR: Wystąpił błąd podczas zapisu danych
                 */
                return userRegistrationService.sendResetPasswordEmail(userOpt.get());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Wystąpił błąd podczas wysyłania e-maila");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Adres email nie istnieje");
        }
    }

    /**
     * Deletes the account of the currently authenticated user.
     */
    @Transactional
    @DeleteMapping("/delete-account")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        User user = userOpt.get();

        try {
            userRepository.deleteByUsername(user.getUsername());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        try {
            emailNotificationService.sendAccountDeletionConfirmationEmail(user.getEmail(), user.getFirstName());
        } catch (MessagingException me) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.noContent().build();
    }


    /**
     *
     * @return status 409 or 200
     */
    @PostMapping("check-email")
    public ResponseEntity<Void> checkEmail(@RequestBody Map<String, String> emailJson) {
        String email = emailJson.get("email");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }


    /**
     *
     * @return status 409 or 200
     */
    @PostMapping("check-username")
    public ResponseEntity<Void> checkLogin(@RequestBody Map<String, String> usernameJson) {
        String username = usernameJson.get("username");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }



    /**
     * Registers a new user.
     */
    @Transactional
    @PostMapping("/registration")
    public ResponseEntity<Void> registerUser(@Valid @RequestBody User user, BindingResult result) {
        if (result.hasErrors()) {
            System.out.println("Validation errors: ");
            result.getAllErrors().forEach(error -> System.out.println(error.toString()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (!user.getPassword().equals(user.getConPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (user.getUsername().equals("anonymousUser")){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        user.setPassword(BcryptUtil.hashPassword(user.getPassword()));

        try {
            user = userRegistrationService.registerUser(user);
            userRepository.save(user);
        } catch (DataIntegrityViolationException | MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Resets the user's password using the provided pincode and email.
     */
    @PutMapping("/reset-password/{pincode}/{email}")
    public ResponseEntity<String> resetPassword(
            @PathVariable("pincode") String pincode,
            @PathVariable("email") String email,
            @Valid @RequestBody User newUser,
            BindingResult result) {

        if (result.hasErrors()) {
            System.out.println("Validation errors: ");
            result.getAllErrors().forEach(error -> System.out.println(error.toString()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (!newUser.getPassword().equals(newUser.getConPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Optional<User> userOpt = userRepository.findByEmailAndConfirmationCode(email, Integer.valueOf(pincode));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Błędne dane, prosimy wygenerować link ponownie");
        }

        User user = userOpt.get();
        if (user.getConfirmationCodeExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.GONE).body("Data ważności linku minęła, prosimy wygenerować link ponownie");
        }

        user.setPassword(BcryptUtil.hashPassword(newUser.getPassword()));
        user.setConfirmationCode(null);
        user.setConfirmationCodeExpiry(null);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Wystąpił błąd w zapisie danych, prosimy spróbować ponownie później");
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Verifies the reset password details using the provided pincode and email.
     */
    @GetMapping("/verify-reset/{pincode}/{email}")
    public ResponseEntity<String> verifyResetDetails(
            @PathVariable("pincode") String pincode,
            @PathVariable("email") String email) {

        Optional<User> userOpt = userRepository.findByEmailAndConfirmationCode(email, Integer.valueOf(pincode));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Błędne dane, prosimy wygenerować link ponownie");
        }

        User user = userOpt.get();
        if (user.getConfirmationCodeExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.GONE).body("Data ważności linku minęła, prosimy wygenerować go ponownie");
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Returns the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !isAnonymousUser(authentication)) {
            return ResponseEntity.ok(authentication.getName());
        } else {
            return ResponseEntity.ok(ANONYMOUS_USER);
        }
    }

    private boolean isAnonymousUser(Authentication authentication) {
        return authentication instanceof AnonymousAuthenticationToken || ANONYMOUS_USER.equals(authentication.getName());
    }
}

