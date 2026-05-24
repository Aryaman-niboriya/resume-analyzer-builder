import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "resume_analyzer"

# Initialize MongoDB client
client = None
db = None

def get_db():
    global client, db
    if db is not None:
        return db
        
    if not MONGO_URI:
        print("Warning: MONGO_URI not found in environment variables.")
        return None
        
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        # Test connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB.")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def save_analysis_report(report_data):
    """
    Saves a generated analysis report to the 'reports' collection.
    """
    database = get_db()
    if database is None:
        return None
        
    try:
        reports_collection = database["reports"]
        result = reports_collection.insert_one(report_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving report to MongoDB: {e}")
        return None
