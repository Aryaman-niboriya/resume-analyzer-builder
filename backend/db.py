import os
import logging
from pymongo import MongoClient

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is not None:
        return _db

    uri = os.environ.get('MONGO_URI')
    
    # Check if the uri is not set or is the placeholder from .env
    if not uri or uri == "mongodb+srv://your_username:your_password@cluster.mongodb.net/?retryWrites=true&w=majority":
        logging.warning("MONGO_URI is not properly set or using default placeholder. Falling back to mongodb://localhost:27017/saas_display")
        uri = 'mongodb://localhost:27017/saas_display'

    try:
        # Increase timeout or try connecting
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        try:
            _db = _client.get_default_database()
        except Exception:
            _db = _client['saas_display']
        return _db
    except Exception as e:
        logging.error(f"Failed to initialize MongoDB client: {e}")
        return None

class MongoDatabaseProxy:
    def __getattr__(self, name):
        real_db = get_db()
        if real_db is None:
            raise Exception("Database connection is not available")
        return getattr(real_db, name)

    def __getitem__(self, name):
        real_db = get_db()
        if real_db is None:
            raise Exception("Database connection is not available")
        return real_db[name]

    def __bool__(self):
        return get_db() is not None

    def __eq__(self, other):
        if other is None:
            return get_db() is None
        return id(self) == id(other)

db = MongoDatabaseProxy()

