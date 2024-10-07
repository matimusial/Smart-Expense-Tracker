package com.example.backendjava.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity(name = "exchange_rates")
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "EUR", nullable = false)
    private float eur;

    @Column(name = "USD", nullable = false)
    private float usd;

    @Column(name = "GBP", nullable = false)
    private float gbp;

    @Column(name = "CZK", nullable = false)
    private float czk;

    @Column(name = "CHF", nullable = false)
    private float chf;

    @Column(name = "NOK", nullable = false)
    private float nok;

    @Column(name = "SEK", nullable = false)
    private float sek;

    @Column(name = "DKK", nullable = false)
    private float dkk;

    @Column(name = "CNY", nullable = false)
    private float cny;

    @Column(name = "HUF", nullable = false)
    private float huf;

    @Column(name = "insert_date", nullable = false)
    private LocalDate insertDate;

    public ExchangeRate() {
    }

    public ExchangeRate(ExchangeRate other) {
        this.eur = other.eur;
        this.usd = other.usd;
        this.gbp = other.gbp;
        this.czk = other.czk;
        this.chf = other.chf;
        this.nok = other.nok;
        this.sek = other.sek;
        this.dkk = other.dkk;
        this.cny = other.cny;
        this.huf = other.huf;
        this.insertDate = other.insertDate;
        this.id = null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public float getEur() {
        return eur;
    }

    public void setEur(float eur) {
        this.eur = eur;
    }

    public float getUsd() {
        return usd;
    }

    public void setUsd(float usd) {
        this.usd = usd;
    }

    public float getGbp() {
        return gbp;
    }

    public void setGbp(float gbp) {
        this.gbp = gbp;
    }

    public float getCzk() {
        return czk;
    }

    public void setCzk(float czk) {
        this.czk = czk;
    }

    public float getChf() {
        return chf;
    }

    public void setChf(float chf) {
        this.chf = chf;
    }

    public float getNok() {
        return nok;
    }

    public void setNok(float nok) {
        this.nok = nok;
    }

    public float getSek() {
        return sek;
    }

    public void setSek(float sek) {
        this.sek = sek;
    }

    public float getDkk() {
        return dkk;
    }

    public void setDkk(float dkk) {
        this.dkk = dkk;
    }

    public float getCny() {
        return cny;
    }

    public void setCny(float cny) {
        this.cny = cny;
    }

    public float getHuf() {
        return huf;
    }

    public void setHuf(float huf) {
        this.huf = huf;
    }

    public LocalDate getInsertDate() {
        return insertDate;
    }

    public void setInsertDate(LocalDate insertDate) {
        this.insertDate = insertDate;
    }
}
