package com.example.backendjava.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;

public class Base64Util {

    public static byte[] convertBase64ToBytes(String base64String) {
        return Base64.getDecoder().decode(base64String);
    }

    public static String convertImageToBase64(String filePath) throws IOException {
        File file = new File(filePath);
        byte[] fileContent = Files.readAllBytes(file.toPath());

        return Base64.getEncoder().encodeToString(fileContent);
    }
}
