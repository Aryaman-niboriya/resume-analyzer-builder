from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(mongo_uri)
db = client['saas_display']

user = db.users.find_one()
if user:
    print(f"User ID: {user['_id']}")
    analysis = db.analyses.find_one({"user_id": str(user['_id'])})
    print(f"Analysis found: {analysis is not None}")
else:
    print("No users found.")
