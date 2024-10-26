package com.example.backendjava.utils;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.core.io.Resource;

import java.util.Base64;

public class Base64Util {

    public static byte[] convertBase64ToBytes(String base64String) {
        return Base64.getDecoder().decode(base64String);
    }

    public static byte[] convertImageToBase64(Resource imgResource) throws IOException {
        try (InputStream inputStream = imgResource.getInputStream()) {
            byte[] fileContent = inputStream.readAllBytes();
            return Base64.getEncoder().encode(fileContent);
        }
    }
}
