import logging
import os

from pymongo import MongoClient

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "healthai_ai")

client = MongoClient(
    MONGO_URL,
    serverSelectionTimeoutMS=1000,
    connectTimeoutMS=1000,
)

db = client[MONGO_DB_NAME]

nutrition_collection = db["nutrition_recommendations"]
workout_collection = db["workout_recommendations"]


def safe_insert_one(collection, document: dict, context: str) -> bool:
    """Persist a document when MongoDB is reachable without breaking the API."""
    try:
        collection.insert_one(document)
        return True
    except Exception:
        logger.exception("MongoDB persistence failed for %s", context)
        return False
