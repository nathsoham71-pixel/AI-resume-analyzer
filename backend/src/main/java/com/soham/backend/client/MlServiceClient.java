package com.soham.backend.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class MlServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    private static final String ML_API_URL =
            "https://ai-resume-analyzer-umra.onrender.com";

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
                            ML_API_URL,
                            request,
                            String.class
                    );

            return response.getBody();

        } catch (Exception e) {

            return "ML Service Error: " + e.getMessage();
        }
    }
}
