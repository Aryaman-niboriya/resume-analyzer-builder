import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini AI using the new SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("Warning: Valid GEMINI_API_KEY not found in environment variables.")

# Initialize the new GenAI client
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Warning: Failed to initialize GenAI client: {e}")
    client = None

# Use the pro model for complex reasoning and structured output
MODEL_NAME = "gemini-2.5-flash"

def analyze_resume(resume_text, job_description):
    """
    Sends the resume text and job description to Gemini AI to generate a structured analysis report.
    Returns a Python dictionary parsed from the AI's JSON response.
    """
    if not client:
        raise Exception("GenAI client not initialized. Please check your GEMINI_API_KEY.")

    prompt = f"""
    You are a RUTHLESS and HIGHLY CRITICAL technical recruiter and ATS (Applicant Tracking System) expert. 
    Your goal is to provide a REALISTIC, data-driven evaluation of a candidate's resume against a specific job description.

    DO NOT give high scores just to be nice. Most resumes fail ATS; your analysis should reflect that reality.
    
    --- RUTHLESS EVALUATION CRITERIA ---
    1. Overall Match Score: 
       - 80%+ : Exceptional match, nearly every requirement met.
       - 60-80% : Good match, but missing key skills or experience.
       - 40-60% : Partial match, significant gaps.
       - Below 40% : Poor match.
    2. ATS Compatibility:
       - Penalize for: Non-standard headers, lack of clear contact info, weird text extraction noise, tables/columns (inferred from text flow), lack of clear Dates/Locations.
       - Score strictly based on structural readability for a machine.
    3. Keyword Match:
       - Only count a match if the EXACT industry-standard keyword or a very close semantic match is found. 
       - Penalize for missing high-priority tech mentioned in the Job Description.

    Your output MUST be a strictly valid JSON object matching this schema EXACTLY:

    {{
      "overallScore": number (0-100),
      "scoreBreakdown": {{
        "skillsMatch": number (0-100),
        "keywordMatch": number (0-100),
        "experienceRelevance": number (0-100),
        "atsCompatibility": number (0-100)
      }},
      "extractedData": {{
        "name": string,
        "email": string,
        "education": string,
        "experienceYears": number,
        "projects": [string, string, ...],
        "allSkills": [string, string, ...]
      }},
      "skillsAnalysis": {{
        "matching": [string, string, ...],
        "missing": [string, string, ...],
        "extra": [string, string, ...]
      }},
      "keywordCoverage": {{
        "percentage": number (0-100),
        "found": [string, string, ...],
        "missing": [string, string, ...]
      }},
      "experienceAnalysis": {{
        "score": number (0-100),
        "relevantYears": number,
        "requiredYears": number,
        "relevantProjects": [string, string, ...],
        "summary": string (Critique the relevance of their background specifically for this role)
      }},
      "atsCompatibility": {{
        "score": number (0-100),
        "checks": [
          {{ "name": "Proper Headings", "passed": boolean }},
          {{ "name": "Clear Sections", "passed": boolean }},
          {{ "name": "Standard Fonts/Encoding", "passed": boolean }},
          {{ "name": "Keyword Density", "passed": boolean }},
          {{ "name": "Format Optimization", "passed": boolean }}
        ]
      }},
      "suggestions": [Provide 3-5 RUTHLESSLY HONEST and ACTIONABLE improvements],
      "skillGap": {{
        "missingRequired": [string, string, ...],
        "recommendedToLearn": [string, string, ...],
        "fastestLearningPath": string (Prioritize fixing the biggest skill gaps)
      }},
      "interviewQuestions": [
        {{ "category": "Technical", "question": string, "hint": "What should they mention to sound like an expert?" }},
        {{ "category": "Experience-Based", "question": string, "hint": "Focus on a potential weakness in their resume" }},
        {{ "category": "Behavioral", "question": string, "hint": "Focus on role-specific traits" }}
      ],
      "finalVerdict": string (A punchy yet deep 2-3 sentence strategic takeaway. Highlight the candidate's unique value proposition, mention one specific reason they stand out, and give a high-stakes interview recommendation.)
    }}

    --- 
    JOB DESCRIPTION:
    {job_description}

    ---
    RESUME TEXT:
    {resume_text}
    
    RETURN ONLY VALID JSON without markdown. Be objective and critical.
    """

    try:
        # Using the new google-genai client syntax
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2, # Low temperature for analytical output
            ),
        )
        
        # Parse the JSON string from Gemini into a Python dictionary
        result_text = response.text
        # Sometimes models wrap in ```json even when told not to. Simple cleanup:
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "", 1)
        if result_text.endswith("```"):
            result_text = result_text[:result_text.rfind("```")]
            
        return json.loads(result_text.strip())
        
    except Exception as e:
        print(f"Error during Gemini API call: {str(e)}")
        # If API fails or parsing fails, return a fallback or re-raise
        raise Exception(f"Failed to analyze resume with AI: {str(e)}")
