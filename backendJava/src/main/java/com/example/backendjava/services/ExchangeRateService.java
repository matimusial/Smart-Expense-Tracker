package com.example.backendjava.services;

import com.example.backendjava.entities.ExchangeRate;
import com.example.backendjava.repositories.ExchangeRateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ExchangeRateService {

    private final WebClient.Builder webClientBuilder;
    private final ExchangeRateRepository exchangeRateRepository;

    @Value("${currency.api.key}")
    private String apiKey;

    @Value("${currency.api.url}")
    private String apiUrl;

    @Autowired
    public ExchangeRateService(WebClient.Builder webClientBuilder,
                               ExchangeRateRepository exchangeRateRepository) {
        this.webClientBuilder = webClientBuilder;
        this.exchangeRateRepository = exchangeRateRepository;
    }

    public ExchangeRate fetchCurrencyRates() {

        Mono<String> response = webClientBuilder.build()
                .get()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .retrieve()
                .bodyToMono(String.class);

        String jsonResponse = response.block();

        try {

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);

            JsonNode ratesNode = rootNode.path("conversion_rates");
            float eur = ratesNode.path("EUR").floatValue();
            float usd = ratesNode.path("USD").floatValue();
            float gbp = ratesNode.path("GBP").floatValue();
            float czk = ratesNode.path("CZK").floatValue();
            float chf = ratesNode.path("CHF").floatValue();
            float nok = ratesNode.path("NOK").floatValue();
            float sek = ratesNode.path("SEK").floatValue();
            float dkk = ratesNode.path("DKK").floatValue();
            float cny = ratesNode.path("CNY").floatValue();
            float huf = ratesNode.path("HUF").floatValue();

            long timestamp = rootNode.path("time_last_update_unix").longValue();
            LocalDate insertDate = Instant.ofEpochSecond(timestamp)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

            ExchangeRate exchangeRate = new ExchangeRate();
            exchangeRate.setEur(1 / eur);
            exchangeRate.setUsd(1 / usd);
            exchangeRate.setGbp(1 / gbp);
            exchangeRate.setCzk(1 / czk);
            exchangeRate.setChf(1 / chf);
            exchangeRate.setNok(1 / nok);
            exchangeRate.setSek(1 / sek);
            exchangeRate.setDkk(1 / dkk);
            exchangeRate.setCny(1 / cny);
            exchangeRate.setHuf(1 / huf);
            exchangeRate.setInsertDate(insertDate);

            return exchangeRate;

        } catch (Exception e) {
            return null;
        }
    }

    public void updateExchangeRateInDatabase(ExchangeRate latestExchangeRate) {

        List<ExchangeRate> exchangeRates = exchangeRateRepository.findAll();

        if (exchangeRates.isEmpty()) {
            ExchangeRate savedExchangeRate = exchangeRateRepository.save(latestExchangeRate);
            ExchangeRate clonedExchangeRate = new ExchangeRate(savedExchangeRate);
            exchangeRateRepository.save(clonedExchangeRate);
            return;
        }

        if (exchangeRates.size() > 2) {
            throw new IllegalStateException("Too many exchange rates in the database. Expected a maximum of 2.");
        }

        ExchangeRate secondExchangeRate = exchangeRates.get(1);

        if (latestExchangeRate.getInsertDate().equals(secondExchangeRate.getInsertDate())) {
            return;
        }

        exchangeRateRepository.delete(exchangeRates.get(0));
        exchangeRateRepository.save(latestExchangeRate);
        System.out.println("New exchange rates updated.");
    }
}
