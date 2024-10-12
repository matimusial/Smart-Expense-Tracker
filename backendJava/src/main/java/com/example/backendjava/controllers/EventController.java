package com.example.backendjava.controllers;

import com.example.backendjava.entities.Event;
import com.example.backendjava.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spring-api/event")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/add-event")
    public ResponseEntity<Map<String, String>> createEvent(@RequestBody Event event) {
        return eventService.getIdAndSave(event);
    }

    @GetMapping("/get-events")
    public ResponseEntity<Map<String, Object>> getEventsByMonth(@RequestParam("date") String data) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-yyyy");
            YearMonth yearMonth = YearMonth.parse(data, formatter);
            List<Event> events = eventService.findWithDate(yearMonth);
            Map<String, Object> response = new HashMap<>();

            if (events == null) {
                response.put("unauthorized", "Brak zalogowanego użytkownika");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            response.put("events", events);
            return ResponseEntity.ok(response);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
