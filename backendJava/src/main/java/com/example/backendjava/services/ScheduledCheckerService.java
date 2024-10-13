package com.example.backendjava.services;

import com.example.backendjava.entities.ExchangeRate;
import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledCheckerService {

    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;

    @Autowired
    public ScheduledCheckerService(UserRepository userRepository,
                                   ExchangeRateService exchangeRateService) {
        this.userRepository = userRepository;
        this.exchangeRateService = exchangeRateService;
    }

    /**
     * Scheduled task that checks for unauthorized user accounts with expired confirmation codes
     * and removes them from the database.
     */
    @Scheduled(fixedRate = 21600000, initialDelay = 900000) // 6 hours, 15 minutes
    @Transactional
    public void checkUserExpiryStatus() {
        LocalDateTime currentTime = LocalDateTime.now();
        List<User> expiredUsers = userRepository.findByIsAuthorizedFalseAndConfirmationCodeExpiryBefore(currentTime);

        for (User user : expiredUsers) {
            userRepository.deleteByUsername(user.getUsername());
            System.out.println("Deleted expired user with username: " + user.getUsername());
        }
    }

    @Scheduled(fixedRate = 43200000, initialDelay = 900000) // 12 hours; 15 minutes
    @Transactional
    public void checkExchangeRate() {
        ExchangeRate latestExchangeRate = exchangeRateService.fetchCurrencyRates();
        exchangeRateService.updateExchangeRateInDatabase(latestExchangeRate);
    }
}
