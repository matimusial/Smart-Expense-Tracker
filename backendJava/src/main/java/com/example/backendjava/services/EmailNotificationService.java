package com.example.backendjava.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    public EmailNotificationService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * Sends a password reset email to the specified recipient.
     */
    public void sendPasswordResetEmail(String to, String url, String firstName) throws MessagingException {
        Context context = new Context();
        context.setVariable("firstName", firstName);
        context.setVariable("url", url);

        String emailBody = templateEngine.process("/resetPasswordTemplate", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Email Service reset hasła");
        helper.setText(emailBody, true);

        ClassPathResource image = new ClassPathResource("static/btc_big.png");
        helper.addInline("btcBigImage", image);
        mailSender.send(message);
        System.out.println("Password reset email sent: URL=" + url + ", Email = " + to);
    }

    /**
     * Sends a registration confirmation email to the specified recipient.
     */
    public void sendRegistrationConfirmationEmail(String to, String url, String firstName) throws MessagingException {
        Context context = new Context();
        context.setVariable("firstName", firstName);
        context.setVariable("url", url);

        String emailBody = templateEngine.process("/registerConfirmationTemplate", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Email Service potwierdzenie rejestracji");
        helper.setText(emailBody, true);

        ClassPathResource image = new ClassPathResource("static/btc_big.png");
        helper.addInline("btcBigImage", image);
        mailSender.send(message);
        System.out.println("Registration confirmation email sent: URL=" + url + ", Email = " + to);
    }
}
