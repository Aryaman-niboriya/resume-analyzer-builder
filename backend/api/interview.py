import json
from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
import datetime
from google import genai
from google.genai import types
from db import db
import os

interview_bp = Blueprint('interview', __name__)

MODEL_NAME = "gemini-2.5-flash"

def _clean_json_response(result_text):
    if result_text.startswith("```json"):
        result_text = result_text.replace("```json", "", 1)
    if result_text.endswith("```"):
        result_text = result_text[:result_text.rfind("```")]
    return result_text.strip()

def _isoformat(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value

def _serialize_history(doc):
    questions = doc.get("questions") or []
    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "job_description": doc.get("job_description") or doc.get("job_title") or "Interview Prep Session",
        "resume_filename": doc.get("resume_filename", ""),
        "resume_preview": doc.get("resume_preview", ""),
        "questions": questions,
        "question_count": len(questions),
        "created_at": _isoformat(doc.get("created_at")),
        "updated_at": _isoformat(doc.get("updated_at")),
    }

def _save_history(user_id, job_description, resume_filename, resume_text, questions):
    if not user_id or db is None:
        return None

    now = datetime.datetime.utcnow()
    doc = {
        "user_id": user_id,
        "job_description": job_description or "General Software Engineering Role",
        "resume_filename": resume_filename or "Uploaded resume",
        "resume_preview": (resume_text or "")[:1200],
        "questions": questions,
        "created_at": now,
        "updated_at": now,
    }
    result = db['interviews'].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_history(doc)

def _append_history(user_id, history_id, job_description, resume_text, questions):
    if not user_id or db is None:
        return None

    interviews_col = db['interviews']
    now = datetime.datetime.utcnow()
    history_doc = None

    if history_id and ObjectId.is_valid(history_id):
        history_doc = interviews_col.find_one({"_id": ObjectId(history_id), "user_id": user_id})

    if history_doc is None:
        history_doc = interviews_col.find_one(
            {"user_id": user_id},
            sort=[("updated_at", -1), ("created_at", -1)]
        )

    if history_doc:
        updated_questions = (history_doc.get("questions") or []) + questions
        interviews_col.update_one(
            {"_id": history_doc["_id"]},
            {
                "$set": {
                    "questions": updated_questions,
                    "updated_at": now,
                }
            }
        )
        history_doc["questions"] = updated_questions
        history_doc["updated_at"] = now
        return _serialize_history(history_doc)

    doc = {
        "user_id": user_id,
        "job_description": job_description or "Interview Prep Session",
        "resume_filename": "Latest analysis",
        "resume_preview": (resume_text or "")[:1200],
        "questions": questions,
        "created_at": now,
        "updated_at": now,
    }
    result = interviews_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_history(doc)

@interview_bp.route('/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if db is None:
        return jsonify([]), 200

    try:
        history = db['interviews'].find({"user_id": user_id}).sort("created_at", -1).limit(20)
        return jsonify([_serialize_history(doc) for doc in history]), 200
    except Exception as e:
        print(f"Interview history error: {e}")
        return jsonify({"error": str(e)}), 500

@interview_bp.route('/history/<history_id>', methods=['PATCH', 'DELETE'])
def update_history(history_id):
    if not ObjectId.is_valid(history_id):
        return jsonify({"error": "Invalid history id"}), 400

    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if db is None:
        return jsonify({"error": "Database not available"}), 500

    try:
        interviews_col = db['interviews']
        query = {"_id": ObjectId(history_id), "user_id": user_id}

        if request.method == 'DELETE':
            result = interviews_col.delete_one(query)
            if result.deleted_count == 0:
                return jsonify({"error": "History item not found"}), 404
            return jsonify({"message": "History item deleted"}), 200

        update_fields = {}
        if 'job_description' in data:
            job_description = (data.get('job_description') or '').strip()
            if not job_description:
                return jsonify({"error": "job_description cannot be empty"}), 400
            update_fields['job_description'] = job_description
        if 'resume_filename' in data:
            update_fields['resume_filename'] = (data.get('resume_filename') or '').strip()

        if not update_fields:
            return jsonify({"error": "No editable fields provided"}), 400

        update_fields['updated_at'] = datetime.datetime.utcnow()
        result = interviews_col.update_one(query, {"$set": update_fields})
        if result.matched_count == 0:
            return jsonify({"error": "History item not found"}), 404

        updated = interviews_col.find_one(query)
        return jsonify(_serialize_history(updated)), 200
    except Exception as e:
        print(f"Interview history update error: {e}")
        return jsonify({"error": str(e)}), 500

@interview_bp.route('/generate', methods=['POST'])
def generate_questions():
    """
    Generate new interview questions based on the user's latest analysis report.
    Takes 'user_id' and 'question_type' ('MCQ', 'Technical', 'Behavioral') in the body.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    question_type = data.get('question_type', 'Technical')
    history_id = data.get('history_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    if db is None:
        return jsonify({"error": "Database not available"}), 500
        
    try:
        # Get the latest analysis context
        analyses_col = db['analyses']
        latest = list(analyses_col.find({"user_id": user_id}).sort("created_at", -1).limit(1))
        
        if not latest:
            return jsonify({"error": "No analysis found for this user. Please analyze a resume first."}), 404
            
        report_data = latest[0].get("report_data", {})
        extracted_data = report_data.get("extractedData", {})
        skills = extracted_data.get("allSkills", [])
        job_title = latest[0].get("job_title", "Software Engineer")
        raw_resume = latest[0].get("raw_resume_text", "")
        
        # Setup Gemini
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
             return jsonify({"error": "GenAI key missing"}), 500
             
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Build prompt based on type
        if question_type == 'MCQ':
             schema_example = """
             [
               {
                 "type": "MCQ",
                 "category": "Multiple Choice",
                 "question": "Which of the following best describes...",
                 "options": ["Option A", "Option B", "Option C", "Option D"],
                 "correctAnswerIndex": 1,
                 "hint": "Explanation of why Option B is correct"
               }
             ]
             """
        else:
             schema_example = f"""
             [
               {{
                 "type": "Regular",
                 "category": "{question_type}",
                 "question": "A specific interview question...",
                 "hint": "What they should mention to sound like an expert"
               }}
             ]
             """
             
        prompt = f"""
        You are an expert technical interviewer evaluating a candidate for the role of '{job_title}'.
        The candidate has the following skills: {', '.join(skills)}.
        {f'Here is the candidates full resume text: {raw_resume}' if raw_resume else ''}
        
        Generate exactly 3 NEW, challenging interview questions of type: {question_type}.
        The questions should be tailored to their specific background and the target role.
        
        Return ONLY a JSON array matching this exact schema:
        {schema_example}
        """
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.6, 
            ),
        )
        
        questions = json.loads(_clean_json_response(response.text))
        history = _append_history(user_id, history_id, job_title, raw_resume, questions)
        
        return jsonify({
            "questions": questions,
            "history_id": history["id"] if history else None,
            "history": history,
        }), 200
        
    except Exception as e:
        print(f"Interview generation error: {e}")
        return jsonify({"error": str(e)}), 500

@interview_bp.route('/upload-and-generate', methods=['POST'])
def upload_and_generate():
    """
    Directly upload a resume to generate an initial batch of interview questions.
    """
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
        
    file = request.files['resume']
    job_description = request.form.get('job_description', 'General Software Engineering Role')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        from api.parser import extract_text_from_file
        from werkzeug.utils import secure_filename
        import os
        
        filename = secure_filename(file.filename)
        os.makedirs('temp_uploads', exist_ok=True)
        temp_path = os.path.join('temp_uploads', filename)
        file.save(temp_path)
        
        resume_text = extract_text_from_file(temp_path, filename)
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        if not resume_text:
            return jsonify({"error": "Could not extract text from the provided file."}), 422
            
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
             return jsonify({"error": "GenAI key missing"}), 500
             
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"""
        You are an expert technical interviewer evaluating a candidate for the role of '{job_description}'.
        Here is the candidate's resume text:
        {resume_text}
        
        Generate exactly 6 interview questions: 2 Technical, 2 Behavioral, and 2 Multiple Choice (MCQ).
        
        Return ONLY a JSON array matching this exact schema:
        [
          {{
            "type": "Regular",
            "category": "Technical",
            "question": "...",
            "hint": "..."
          }},
          {{
            "type": "MCQ",
            "category": "Multiple Choice",
            "question": "...",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 1,
            "hint": "Explanation of why it is correct"
          }}
        ]
        """
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.6, 
            ),
        )
        
        questions = json.loads(_clean_json_response(response.text))
        
        # Save dummy analysis so /generate works later for this user
        user_id = request.form.get('user_id')
        history = _save_history(user_id, job_description, file.filename, resume_text, questions)

        if user_id and db is not None:
            try:
                doc = {
                    "user_id": user_id,
                    "job_title": job_description[:50],
                    "overall_score": 0,
                    "report_data": {
                        "extractedData": {
                            "allSkills": [] # Can't extract easily here, but we pass the full text
                        }
                    },
                    "raw_resume_text": resume_text, # Save raw text for context
                    "created_at": datetime.datetime.utcnow(),
                    "is_partial": True
                }
                db['analyses'].insert_one(doc)
            except Exception as e:
                print(f"Failed to save temp analysis: {e}")
                
        return jsonify({
            "questions": questions,
            "history_id": history["id"] if history else None,
            "history": history,
        }), 200
        
    except Exception as e:
        print(f"Direct generation error: {e}")
        return jsonify({"error": str(e)}), 500
