package com.example.backendjava.components;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    /**
     * Handles authentication failures by sending an appropriate error message to the client.
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String errorMessage = "Błędny login lub hasło";

        if (exception.getMessage().equalsIgnoreCase("User not found")) {
            errorMessage = "Błędny login";
        } else if (exception.getMessage().equalsIgnoreCase("User is not authorized")) {
            errorMessage = "Profil nie został zautoryzowany";
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write("{\"message\": \"" + errorMessage + "\"}");
    }
}
