import os
import io
import json
from flask import Blueprint, request, jsonify
import google.generativeai as genai
import fitz  # PyMuPDF
from api.auth import token_required

# Initialize Blueprint
builder_bp = Blueprint('builder', __name__)

# Verify Gemini API key is configured
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Helper function to extract text from PDF
def extract_text_from_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@builder_bp.route('/extract', methods=['POST'])
@token_required
def extract_master_profile(current_user):
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are supported"}), 400
        
    try:
        pdf_text = extract_text_from_pdf(file.read())
        
        # Use Gemini to extract structured data
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Extract the resume information from the following text and return it as a structured JSON object. 
        Follow this exact structure:
        {{
            "personalInfo": {{"fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""}},
            "summary": "",
            "experience": [
                {{"company": "", "role": "", "startDate": "", "endDate": "", "description": ""}}
            ],
            "education": [
                {{"institution": "", "degree": "", "graduationYear": "", "gpa": ""}}
            ],
            "skills": "",
            "projects": [
                {{"name": "", "description": "", "link": ""}}
            ]
        }}
        
        Resume Text:
        {pdf_text}
        
        Return ONLY valid JSON and nothing else.
        """
        
        response = model.generate_content(prompt)
        json_text = response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:-3]
        elif json_text.startswith("```"):
            json_text = json_text[3:-3]
            
        profile_data = json.loads(json_text)
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@builder_bp.route('/generate', methods=['POST'])
@token_required
def generate_tailored_resume(current_user):
    data = request.json
    master_profile = data.get('masterProfile')
    job_description = data.get('jobDescription')
    
    if not master_profile or not job_description:
        return jsonify({"error": "Master Profile and Job Description are required"}), 400
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are an expert ATS Resume Writer and Career Coach. 
        I have a Master Profile containing all my experiences, and a specific Job Description I am applying for.
        
        Job Description:
        {job_description}
        
        Master Profile Data:
        {json.dumps(master_profile)}
        
        Task: 
        1. Select ONLY the most relevant experiences, skills, and projects from my Master Profile that match this JD.
        2. Rewrite the bullet points ('description') using the STAR method (Situation, Task, Action, Result). 
        3. Naturally integrate keywords from the Job Description into the bullets and summary.
        4. Focus heavily on impact, adding estimated metrics if contextually appropriate but keep it professional.
        5. Return a highly optimized, tailored 1-page resume in the exact same JSON format as the Master Profile.
        
        Return ONLY valid JSON and nothing else.
        """
        
        response = model.generate_content(prompt)
        json_text = response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:-3]
        elif json_text.startswith("```"):
            json_text = json_text[3:-3]
            
        tailored_resume = json.loads(json_text)
        return jsonify(tailored_resume), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@builder_bp.route('/cover-letter', methods=['POST'])
@token_required
def generate_cover_letter(current_user):
    data = request.json
    tailored_resume = data.get('tailoredResume')
    job_description = data.get('jobDescription')
    
    if not tailored_resume or not job_description:
        return jsonify({"error": "Tailored Resume and Job Description are required"}), 400
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are an expert Career Coach.
        Write a highly compelling, professional, and concise Cover Letter using the candidate's tailored resume and the target Job Description.
        
        Job Description:
        {job_description}
        
        Tailored Resume:
        {json.dumps(tailored_resume)}
        
        Structure:
        - Professional Greeting (if hiring manager name is found in JD, use it, else generic).
        - Hook: 1 strong sentence about why they fit.
        - Body: 2 short paragraphs highlighting the 2 biggest achievements that exactly match the JD.
        - Conclusion & Call to Action.
        
        Return pure text. Do not wrap in markdown blocks.
        """
        response = model.generate_content(prompt)
        return jsonify({"coverLetter": response.text.strip()}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
