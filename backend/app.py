import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from api.upload import upload_bp
from api.builder import builder_bp
from api.hr_mode import hr_mode_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    cors_origins = [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]
    extra_origins = os.environ.get("CORS_ORIGINS", "")
    if extra_origins:
        cors_origins.extend(o.strip() for o in extra_origins.split(",") if o.strip())
    CORS(app, resources={r"/api/*": {"origins": list(dict.fromkeys(cors_origins))}})
    
    # Register blueprints
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    from api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(builder_bp, url_prefix='/api/builder')
    app.register_blueprint(hr_mode_bp, url_prefix='/api/hr_mode')
    
    from api.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    from api.interview import interview_bp
    app.register_blueprint(interview_bp, url_prefix='/api/interview')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "service": "resume-analyzer-api"}), 200
        
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    # Run server
    app.run(host='0.0.0.0', port=port, debug=True)
