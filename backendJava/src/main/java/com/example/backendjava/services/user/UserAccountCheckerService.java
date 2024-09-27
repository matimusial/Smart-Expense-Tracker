package com.example.backendjava.services.user;

import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserAccountCheckerService {

    private final UserRepository userRepository;

    @Autowired
    public UserAccountCheckerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Scheduled task that checks for unauthorized user accounts with expired confirmation codes
     * and removes them from the database.
     */
    @Scheduled(fixedRate = 21600000) // 6 hours
    @Transactional
    public void checkUserExpiryStatus() {
        LocalDateTime currentTime = LocalDateTime.now();
        List<User> expiredUsers = userRepository.findByIsAuthorizedFalseAndConfirmationCodeExpiryBefore(currentTime);

        for (User user : expiredUsers) {
            userRepository.deleteByUsername(user.getUsername());
            System.out.println("Deleted expired user with username: " + user.getUsername());
        }
    }
}
