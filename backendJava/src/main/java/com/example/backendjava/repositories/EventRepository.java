package com.example.backendjava.repositories;

import com.example.backendjava.entities.Event;
import com.example.backendjava.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    Optional<Event> findTopByUserOrderByDateAsc(User user);
}

