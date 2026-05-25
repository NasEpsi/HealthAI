from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017")

db = client["healthai_ai"]

nutrition_collection = db["nutrition_recommendations"]
workout_collection = db["workout_recommendations"]
