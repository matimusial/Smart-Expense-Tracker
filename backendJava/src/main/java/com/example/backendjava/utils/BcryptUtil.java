package com.example.backendjava.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptUtil {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    public static String hashPassword(String plainPassword) {
        return ENCODER.encode(plainPassword);
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return ENCODER.matches(plainPassword, hashedPassword);
    }
}
