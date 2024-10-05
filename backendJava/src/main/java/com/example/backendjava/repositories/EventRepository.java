package com.example.backendjava.repositories;

import com.example.backendjava.entities.Event;
import com.example.backendjava.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserAndDateBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
}
