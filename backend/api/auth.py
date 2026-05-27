import os
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from bson.objectid import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Import the db instance
from db import db

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-key-change-me-in-production')
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

@auth_bp.route('/register', methods=['POST'])
def register():
    if not db:
         return jsonify({"error": "Database connection error"}), 500
         
    data = request.get_json()
    if not data:
         return jsonify({"error": "Invalid request body"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing name, email, or password"}), 400

    users_collection = db['users']

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists with this email"}), 400

    hashed_password = generate_password_hash(password)

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.datetime.utcnow()
    }

    result = users_collection.insert_one(new_user)
    
    # Generate token
    token = jwt.encode({
        'user_id': str(result.inserted_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {"id": str(result.inserted_id), "name": name, "email": email}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    if not db:
         return jsonify({"error": "Database connection error"}), 500

    data = request.get_json()
    if not data:
         return jsonify({"error": "Invalid request body"}), 400

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing email or password"}), 400

    users_collection = db['users']
    user = users_collection.find_one({"email": email})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": str(user['_id']), "name": user['name'], "email": user['email']}
    }), 200

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({"error": "Token is missing!"}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            users_collection = db['users']
            current_user = users_collection.find_one({"_id": ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({"error": "User not found!"}), 401
        except Exception as e:
            return jsonify({"error": "Token is invalid!", "details": str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        "id": str(current_user['_id']),
        "name": current_user.get('name', ''),
        "email": current_user.get('email', ''),
        "job_title": current_user.get('job_title', ''),
        "bio": current_user.get('bio', '')
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400
        
    update_fields = {}
    if 'name' in data:
        update_fields['name'] = data['name']
    if 'job_title' in data:
        update_fields['job_title'] = data['job_title']
    if 'bio' in data:
        update_fields['bio'] = data['bio']
        
    if update_fields:
        users_collection = db['users']
        users_collection.update_one(
            {"_id": current_user['_id']},
            {"$set": update_fields}
        )
        
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": str(current_user['_id']),
            "name": update_fields.get('name', current_user.get('name', '')),
            "email": current_user.get('email', ''),
            "job_title": update_fields.get('job_title', current_user.get('job_title', '')),
            "bio": update_fields.get('bio', current_user.get('bio', ''))
        }
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    if not db:
         return jsonify({"error": "Database connection error"}), 500

    data = request.get_json()
    if not data or 'credential' not in data:
         return jsonify({"error": "Missing Google ID token"}), 400

    token = data['credential']

    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google Client ID is not configured on the server. Please add it to your environment variables."}), 500

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=10)
        
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        users_collection = db['users']
        user = users_collection.find_one({"email": email})
        
        if not user:
             new_user = {
                 "name": name,
                 "email": email,
                 "password": "", 
                 "created_at": datetime.datetime.utcnow(),
                 "auth_provider": "google"
             }
             result = users_collection.insert_one(new_user)
             user_id = str(result.inserted_id)
        else:
             user_id = str(user['_id'])
             
        app_token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "message": "Google Login successful",
            "token": app_token,
            "user": {"id": user_id, "name": name, "email": email}
        }), 200

    except ValueError as e:
        print(f"Google Token Verification Error: {str(e)}")
        return jsonify({"error": "Invalid Google token", "details": str(e)}), 401
