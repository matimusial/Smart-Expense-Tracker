package com.example.backendjava.services;

import com.example.backendjava.entities.Event;
import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.EventRepository;
import com.example.backendjava.repositories.UserRepository;
import com.example.backendjava.utils.Base64Util;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.io.InputStream;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public EventService(EventRepository eventRepository, UserRepository userRepository,
                        ObjectMapper objectMapper) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ResponseEntity<Void> getIdAndSave(Event event) {
        User user = getCurrentUser();

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            if (event.getBase64String() != null){
                event.setReceiptImage(Base64Util.convertBase64ToBytes(event.getBase64String()));
            }
            event.setUser(user);
            eventRepository.save(event);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    public ResponseEntity<Void> loadDemo(){
        User user = getCurrentUser();

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Resource resource = new ClassPathResource("static/demo-data.json");
            InputStream inputStream = resource.getInputStream();
            List<Event> events = objectMapper.readValue(inputStream, new TypeReference<>() {});

            List<BigDecimal> imgNames = Arrays.asList(
                    BigDecimal.valueOf(0.65),
                    BigDecimal.valueOf(2.29),
                    BigDecimal.valueOf(2.75),
                    BigDecimal.valueOf(2.86),
                    BigDecimal.valueOf(3.29),
                    BigDecimal.valueOf(3.58),
                    BigDecimal.valueOf(4.99),
                    BigDecimal.valueOf(5.59),
                    BigDecimal.valueOf(6.87),
                    BigDecimal.valueOf(7.07),
                    BigDecimal.valueOf(7.57),
                    BigDecimal.valueOf(8.77),
                    BigDecimal.valueOf(9.88),
                    BigDecimal.valueOf(11.49),
                    BigDecimal.valueOf(12.80),
                    BigDecimal.valueOf(13.18),
                    BigDecimal.valueOf(14.02),
                    BigDecimal.valueOf(15.29),
                    BigDecimal.valueOf(16.38),
                    BigDecimal.valueOf(22.71),
                    BigDecimal.valueOf(25.52),
                    BigDecimal.valueOf(27.34),
                    BigDecimal.valueOf(29.78),
                    BigDecimal.valueOf(30.39),
                    BigDecimal.valueOf(31.79),
                    BigDecimal.valueOf(32.41),
                    BigDecimal.valueOf(58.06),
                    BigDecimal.valueOf(69.22),
                    BigDecimal.valueOf(76.14),
                    BigDecimal.valueOf(79.66)
            );

            for (Event event : events) {
                event.setUser(user);
                if (imgNames.contains(event.getAmount())) {
                    Resource imgResource = new ClassPathResource("static/receipts/" + event.getAmount().toPlainString() + ".jpg");
                    if (imgResource.exists()) {
                        event.setReceiptImage(Base64Util.convertImageToBase64(imgResource));
                    } else {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                }
            }
            eventRepository.saveAll(events);

            return ResponseEntity.status(HttpStatus.CREATED).build();

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !isAnonymousUser(authentication)) {
            String username = authentication.getName();

            Optional<User> userOpt = userRepository.findByUsername(username);
            return userOpt.orElse(null);
        }
        return null;
    }

    private boolean isAnonymousUser(Authentication authentication) {
        final String ANONYMOUS_USER = "anonymousUser";
        return authentication instanceof AnonymousAuthenticationToken || ANONYMOUS_USER.equals(authentication.getName());
    }

    public Map<String, Object> findWithDate(LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return null;
        }
        Optional<Event> userOpt = eventRepository.findTopByUserOrderByDateAsc(currentUser);
        LocalDate firstEventDate = null;

        if (userOpt.isPresent()) {
            firstEventDate = userOpt.get().getDate();
        }
        Map<String, Object> response = new HashMap<>();
        response.put("firstEventDate", firstEventDate);
        response.put("events", eventRepository.findByUserAndDateBetween(currentUser, startDate, endDate));
        return response;

    }
}
