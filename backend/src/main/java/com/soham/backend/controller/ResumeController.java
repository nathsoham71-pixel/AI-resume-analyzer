package com.soham.backend.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soham.backend.util.PdfExtractorUtil;
import com.soham.backend.client.MlServiceClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResumeController {

    @Autowired
    private MlServiceClient mlServiceClient;

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file) {

        try {

            // ----------------------------------------
            // CHECK EMPTY FILE
            // ----------------------------------------

            if (file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "error", "Please upload a valid file."
                        ));
            }

            // ----------------------------------------
            // VALIDATE FILE NAME
            // ----------------------------------------

            String fileName = file.getOriginalFilename();

            if (fileName == null || fileName.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "error", "Invalid file name."
                        ));
            }

            // ----------------------------------------
            // VALIDATE FILE TYPE
            // ----------------------------------------

            String lowerFileName = fileName.toLowerCase();

            if (!(lowerFileName.endsWith(".pdf")
                    || lowerFileName.endsWith(".doc")
                    || lowerFileName.endsWith(".docx"))) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "error",
                                "Only PDF, DOC, and DOCX files are allowed."
                        ));
            }

            // ----------------------------------------
            // CREATE UPLOAD DIRECTORY
            // ----------------------------------------

            File uploadFolder = new File(UPLOAD_DIR);

            if (!uploadFolder.exists()) {

                boolean folderCreated = uploadFolder.mkdirs();

                if (!folderCreated) {

                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of(
                                    "success", false,
                                    "error",
                                    "Failed to create uploads directory."
                            ));
                }
            }

            // ----------------------------------------
            // SAVE FILE
            // ----------------------------------------

            File destinationFile =
                    new File(UPLOAD_DIR + fileName);

            file.transferTo(destinationFile);

            // ----------------------------------------
            // EXTRACT PDF TEXT
            // ----------------------------------------

            String extractedText =
                    PdfExtractorUtil.extractText(destinationFile);

            if (extractedText == null
                    || extractedText.trim().isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "error",
                                "Failed to extract text from resume."
                        ));
            }

            // ----------------------------------------
            // SEND TO ML SERVICE
            // ----------------------------------------

            String analysisResult =
                mlServiceClient.analyzeResume(extractedText);

            ObjectMapper mapper = new ObjectMapper();

            Object analysisJson =
                mapper.readValue(analysisResult, Object.class);

            // ----------------------------------------
            // FINAL JSON RESPONSE
            // ----------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put("success", true);

            response.put(
                    "message",
                    "Resume uploaded successfully"
            );

            response.put(
                    "saved_file",
                    fileName
            );

            response.put(
                    "analysis",
                    analysisJson
            );

            return ResponseEntity.ok(response);

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error",
                            "File saving failed: " + e.getMessage()
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error",
                            "Unexpected error: " + e.getMessage()
                    ));
        }
    }
}