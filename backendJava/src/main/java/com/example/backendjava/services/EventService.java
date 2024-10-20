package com.example.backendjava.services;

import com.example.backendjava.entities.Event;
import com.example.backendjava.entities.User;
import com.example.backendjava.repositories.EventRepository;
import com.example.backendjava.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Autowired
    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<Map<String, String>> getIdAndSave(Event event) {
        User user = getCurrentUser();
        Map<String, String> response = new HashMap<>();

        if (user == null) {
            response.put("unauthorized", "Brak zalogowanego użytkownika");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        try {
            event.setUser(user);
            eventRepository.save(event);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
        System.out.println("chuj3");
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
