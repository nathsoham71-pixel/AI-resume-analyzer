package com.soham.backend.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class MlServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlApiUrl;

    public String analyzeResume(String resumeText) {

        try {

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("resume_text", resumeText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            mlApiUrl + "/analyze",
                            request,
                            String.class
                    );

            return response.getBody();

        } catch (Exception e) {

            return "ML Service Error: " + e.getMessage();
        }
    }
}