package com.example.backendjava.controllers;

import com.example.backendjava.entities.Event;
import com.example.backendjava.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
    public ResponseEntity<Map<String, Object>> getEventsByMonth(@RequestParam("startDate") String startDate,
                                                                @RequestParam("endDate") String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate parsedStartDate = LocalDate.parse(startDate, formatter);
            LocalDate parsedEndDate = LocalDate.parse(endDate, formatter);
            Map<String, Object> response = eventService.findWithDate(parsedStartDate, parsedEndDate);
            LocalDate firstEventDate =  (LocalDate) response.get("firstEventDate");
            if (firstEventDate == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.ok(response);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
