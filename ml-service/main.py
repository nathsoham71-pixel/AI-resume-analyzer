from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging
import os
import json

import google.generativeai as genai
from dotenv import load_dotenv

# ---------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ---------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ---------------------------------------------------
# LOGGER CONFIGURATION
# ---------------------------------------------------

logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------
# VALIDATE GEMINI API KEY
# ---------------------------------------------------

if not GEMINI_API_KEY:
    raise Exception(
        "Gemini API key not found in .env file"
    )

# ---------------------------------------------------
# CONFIGURE GEMINI
# ---------------------------------------------------

try:

    genai.configure(api_key=GEMINI_API_KEY)

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite"
    )

except Exception as e:

    raise Exception(
        f"Failed to initialize Gemini model: {str(e)}"
    )

# ---------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------

app = FastAPI()

# ---------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------

class ResumeRequest(BaseModel):
    resume_text: str

# ---------------------------------------------------
# HOME ROUTE
# ---------------------------------------------------

@app.get("/")
def home():

    try:

        return {
            "message": "ML Service is running successfully"
        }

    except Exception as e:

        logging.error(f"Home endpoint error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Home endpoint failed."
        )

# ---------------------------------------------------
# HEALTH CHECK ROUTE
# ---------------------------------------------------

@app.get("/health")
def health_check():

    try:

        return {
            "status": "healthy"
        }

    except Exception as e:

        logging.error(f"Health check error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Health check failed."
        )

# ---------------------------------------------------
# RESUME ANALYSIS ROUTE
# ---------------------------------------------------

@app.post("/analyze")
def analyze_resume(data: ResumeRequest):

    try:

        # -------------------------------------------
        # VALIDATE REQUEST BODY
        # -------------------------------------------

        if data is None:
            raise HTTPException(
                status_code=400,
                detail="Request body is missing."
            )

        # -------------------------------------------
        # VALIDATE resume_text FIELD
        # -------------------------------------------

        if not hasattr(data, "resume_text"):
            raise HTTPException(
                status_code=400,
                detail="resume_text field is missing."
            )

        if data.resume_text is None:
            raise HTTPException(
                status_code=400,
                detail="Resume text is null."
            )

        if not isinstance(data.resume_text, str):
            raise HTTPException(
                status_code=400,
                detail="Resume text must be a string."
            )

        if not data.resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text cannot be empty."
            )

        # -------------------------------------------
        # VERY LARGE INPUT CHECK
        # -------------------------------------------

        if len(data.resume_text) > 50000:
            raise HTTPException(
                status_code=413,
                detail="Resume text too large to process."
            )

        resume_text = data.resume_text.strip()

        logging.info("Resume text received successfully")

        # -------------------------------------------
        # GEMINI PROMPT
        # -------------------------------------------

        prompt = f"""
You are an advanced ATS resume analyzer.

Analyze the resume carefully.

Return ONLY valid JSON.

Do not add explanations.
Do not add markdown.
Do not use triple backticks.

Required JSON format:

{{
    "ats_score": number,
    "technical_skills": [],
    "missing_skills": [],
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
    "recommended_roles": [],
    "interview_questions": []
}}

Resume:
{resume_text}
"""

        # -------------------------------------------
        # GEMINI API REQUEST
        # -------------------------------------------

        try:

            response = model.generate_content(prompt)

        except Exception as gemini_error:

            logging.error(
                f"Gemini API request failed: {str(gemini_error)}"
            )

            raise HTTPException(
                status_code=502,
                detail=f"Gemini API failed: {str(gemini_error)}"
            )

        # -------------------------------------------
        # VALIDATE GEMINI RESPONSE
        # -------------------------------------------

        if response is None:
            raise HTTPException(
                status_code=500,
                detail="Empty response received from Gemini."
            )

        if not hasattr(response, "text"):
            raise HTTPException(
                status_code=500,
                detail="Invalid Gemini response structure."
            )

        if response.text is None or not response.text.strip():
            raise HTTPException(
                status_code=500,
                detail="Gemini returned empty analysis."
            )

        logging.info(
            "Gemini analysis completed successfully"
        )

        # -------------------------------------------
        # CLEAN + PARSE JSON RESPONSE
        # -------------------------------------------

        try:

            cleaned_response = response.text.strip()

            analysis_json = json.loads(cleaned_response)

            return {
                "success": True,
                "analysis": analysis_json
            }

        except json.JSONDecodeError:

            logging.error(
                "Gemini returned invalid JSON"
            )

            return {
                "success": False,
                "error": "Gemini returned invalid JSON",
                "raw_response": response.text
            }

    # ------------------------------------------------
    # FASTAPI HTTP ERRORS
    # ------------------------------------------------

    except HTTPException as http_error:

        raise http_error

    # ------------------------------------------------
    # MEMORY ERRORS
    # ------------------------------------------------

    except MemoryError:

        logging.error(
            "Memory overflow while processing resume"
        )

        raise HTTPException(
            status_code=500,
            detail="Server memory overflow."
        )

    # ------------------------------------------------
    # UNEXPECTED ERRORS
    # ------------------------------------------------

    except Exception as e:

        logging.error(
            f"Unexpected resume analysis error: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  