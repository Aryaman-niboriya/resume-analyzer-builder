import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from api.parser import extract_text_from_file
from api.ai import analyze_resume

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/', methods=['POST'])
def upload_resume():
    # 1. Validate the Request
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    
    file = request.files['resume']
    # Match the naming convention the frontend uses
    job_description = request.form.get('job_description', '') 
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not job_description:
        return jsonify({"error": "Job description is required"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PDF and DOCX are allowed."}), 400
        
    # 2. Secure and Save the File Temporarily
    filename = secure_filename(file.filename)
    # Ensure a temp directory exists
    os.makedirs('temp_uploads', exist_ok=True)
    temp_path = os.path.join('temp_uploads', filename)
    file.save(temp_path)
    
    try:
        # 3. Extract Text from the File
        print(f"Extracting text from {filename}...")
        resume_text = extract_text_from_file(temp_path, filename)
        
        if not resume_text:
            return jsonify({"error": "Could not extract text from the provided file. Please try another resume."}), 422
            
        print(f"Successfully extracted {len(resume_text)} characters from resume.")
        
        # 4. Generate AI Analysis Report using Gemini
        print("Sending to Gemini for analysis...")
        analysis_report_json = analyze_resume(resume_text, job_description)
        print("AI Analysis Complete!")
        
        # 5. Save the analysis to the database for the dashboard
        user_id = request.form.get('user_id')
        if user_id:
            try:
                from db import db
                if db is not None:
                    import datetime
                    doc = {
                        "user_id": user_id,
                        "job_title": "Analyzed Role", # We could use an LLM extraction later, but this is fine
                        "overall_score": analysis_report_json.get("overallScore", 0),
                        "report_data": analysis_report_json,
                        "created_at": datetime.datetime.utcnow(),
                    }
                    db['analyses'].insert_one(doc)
            except Exception as db_e:
                print(f"Warning: Failed to save analysis to DB: {db_e}")
        
        # 6. Return the JSON payload back to the React app
        return jsonify(analysis_report_json), 200
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": f"An error occurred during analysis: {str(e)}"}), 500
        
    finally:
        # Cleanup: Remove the temporary uploaded file
        if os.path.exists(temp_path):
            os.remove(temp_path)

