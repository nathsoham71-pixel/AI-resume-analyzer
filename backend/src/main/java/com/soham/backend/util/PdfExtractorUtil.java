package com.soham.backend.util;

import org.apache.tika.Tika;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

public class PdfExtractorUtil {

    public static String extractText(File file) {

        try {

            // Null file check
            if (file == null) {
                return "Error: File reference is null.";
            }

            // File existence check
            if (!file.exists()) {
                return "Error: File does not exist.";
            }

            // Check if path is actually a file
            if (!file.isFile()) {
                return "Error: Provided path is not a valid file.";
            }

            // Empty file check
            if (file.length() == 0) {
                return "Error: Uploaded file is empty.";
            }

            // Initialize Apache Tika
            Tika tika = new Tika();

            // Extract text
            String extractedText = tika.parseToString(file);

            // Check extracted content
            if (extractedText == null || extractedText.trim().isEmpty()) {
                return "Error: No readable text found in file.";
            }

            return extractedText;

        } catch (FileNotFoundException e) {

            return "Error: File not found - " + e.getMessage();

        } catch (IOException e) {

            return "Error reading file - " + e.getMessage();

        } catch (SecurityException e) {

            return "Security error accessing file - " + e.getMessage();

        } catch (OutOfMemoryError e) {

            return "File too large to process.";

        } catch (Exception e) {

            return "Unexpected PDF extraction error - " + e.getMessage();
        }
    }
}
