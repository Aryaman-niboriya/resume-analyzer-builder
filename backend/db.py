import os
import logging
from pymongo import MongoClient

def get_db():
    uri = os.environ.get('MONGO_URI')
    
    # Check if the uri is not set or is the placeholder from .env
    if not uri or uri == "mongodb+srv://your_username:your_password@cluster.mongodb.net/?retryWrites=true&w=majority":
        logging.warning("MONGO_URI is not properly set or using default placeholder. Falling back to mongodb://localhost:27017/saas_display")
        uri = 'mongodb://localhost:27017/saas_display'

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        try:
            db = client.get_default_database()
        except Exception:
            db = client['saas_display']
        return db
    except Exception as e:
        logging.error(f"Failed to initialize MongoDB client: {e}")
        return None

db = get_db()
