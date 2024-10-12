package com.example.backendjava.controllers;

import com.example.backendjava.entities.ExchangeRate;
import com.example.backendjava.repositories.ExchangeRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spring-api")
public class CurrencyController {

    private final ExchangeRateRepository exchangeRateRepository;

    @Autowired
    public CurrencyController(ExchangeRateRepository exchangeRateRepository) {
        this.exchangeRateRepository = exchangeRateRepository;
    }

    @GetMapping("/currency-rates")
    public ResponseEntity<Map<String, Object>> getExchangeRates() {

        List<ExchangeRate> exchangeRates = exchangeRateRepository.findAll();
        if (exchangeRates.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> response = new HashMap<>();
        response.put("prevRateList", exchangeRates.get(0));
        response.put("currentRateList", exchangeRates.get(1));
        return ResponseEntity.ok(response);
    }
}
