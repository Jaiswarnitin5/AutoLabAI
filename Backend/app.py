# ================= IMPORTS =================
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import subprocess
import sys
import re
from bson.objectid import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

# Fix encoding
sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

load_dotenv()

ai_client = OpenAI(
    api_key="paste your real GROK API key here",  # 👈 paste real key
    base_url="https://api.groq.com/openai/v1"
)

# ================= DATABASE =================
client = MongoClient(
    "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority",
    tls=True,
    tlsAllowInvalidCertificates=True
)
db = client["ai_lab_system"]

users_collection = db["users"]
reports_collection = db["reports"]
viva_sessions_collection = db["viva_sessions"]

SECRET_KEY = os.getenv("SECRET_KEY")

# ===== TEST ROUTE =====
@app.route("/ping")
def ping():
    return {"message": "Server alive"}


# ================= TOKEN DECORATOR =================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token missing"}), 403

        try:
            token = auth_header.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_email = data["email"]
            request.user_role = data.get("role", "user")
        except:
            return jsonify({"error": "Invalid or expired token"}), 403

        return f(*args, **kwargs)
    return decorated

# ==================== AI CHAT WITH GROK =================
def ask_ai(prompt):
    try:
        response = ai_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"AI Error: {str(e)}"


# ===== MONGO TEST ROUTE =====
@app.route("/mongo-test")
def mongo_test():
    try:
        users_collection.find_one({})
        return {"message": "Mongo connected"}
    except Exception as e:
        return {"error": str(e)}



# ================= REGISTER =================
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    users_collection.insert_one({
        "email": email,
        "password": generate_password_hash(password),
        "role": "user"
    })

    return jsonify({"message": "User registered successfully"})


# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        print("Incoming data:", data)

        email = data.get("email")
        password = data.get("password")

        user = users_collection.find_one({"email": email})
        print("User found:", user)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password"}), 401

        role = user.get("role", "user")

        token = jwt.encode({
            "email": email,
            "role": role,
            "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token, "role": role})

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    

@app.route("/google-login", methods=["POST"])
def google_login():
    data = request.json
    token = data.get("token")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

        user = users_collection.find_one({"email": email})

        if not user:
            users_collection.insert_one({
                "email": email,
                "password": None,
                "role": "user",
                "name": name,
                "picture": picture,
                "provider": "google"
            })
            role = "user"
        else:
            role = user.get("role", "user")

        jwt_token = jwt.encode({
            "email": email,
            "role": role,
            "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=4)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": jwt_token, "role": role})

    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 403

    
@app.route("/generate", methods=["POST"])
@token_required
def generate():
    data = request.json
    aim = data.get("aim")

    if not aim:
        return jsonify({"error": "No aim provided"}), 400

    prompt = f"""
Generate complete lab practical report for:
{aim}

Include:
- AIM
- THEORY
- ALGORITHM
- PROGRAM CODE
- SAMPLE OUTPUT
- 5 VIVA QUESTIONS
"""

    report_text = ask_ai(prompt)

    reports_collection.insert_one({
        "email": request.user_email,
        "aim": aim,
        "text": report_text,
        "created_at": datetime.datetime.now(datetime.UTC)
    })

    return jsonify({"text": report_text})


# ================= AI CHAT =================
@app.route("/ai-chat", methods=["POST"])
@token_required
def ai_chat():
    data = request.json
    message = data.get("message")

    prompt = f"""
You are an AI tutor helping engineering students.

User Question:
{message}
"""

    reply = ask_ai(prompt)
    return jsonify({"reply": reply})


# ================= START VIVA =================
@app.route("/viva/start", methods=["POST"])
@token_required
def start_viva():
    data = request.json

    topic = data.get("topic")
    difficulty = data.get("difficulty", "Medium")
    language = data.get("language", "English")

    if not topic or topic.strip() == "":
        return jsonify({"error": "Topic required"}), 400

    # 🌍 Language Instruction
    if language == "Hindi":
        lang_instruction = "Generate questions in Hindi language."
    elif language == "Marathi":
        lang_instruction = "Generate questions in Marathi language."
    elif language == "Gujarati":
        lang_instruction = "Generate questions in Gujarati language."
    else:
        lang_instruction = "Generate questions in English language."

    prompt = f"""
Generate 5 {difficulty} level technical viva questions for:
{topic}

{lang_instruction}

Rules:
- Return only numbered questions.
- Do NOT include answers.
- Keep them suitable for oral viva.
"""

    output = ask_ai(prompt)

    questions = [
        line.strip()
        for line in output.split("\n")
        if line.strip() != ""
    ]

    if len(questions) == 0:
        return jsonify({"error": "No questions generated"}), 500

    session = {
        "email": request.user_email,
        "topic": topic,
        "difficulty": difficulty,
        "language": language,
        "questions": questions,
        "answers": [],
        "scores": [],
        "total_score": 0,
        "created_at": datetime.datetime.now(datetime.UTC)
    }

    inserted = viva_sessions_collection.insert_one(session)

    return jsonify({
        "session_id": str(inserted.inserted_id),
        "questions": questions
    })


# ================= SUBMIT ANSWER =================
@app.route("/viva/answer", methods=["POST"])
@token_required
def viva_answer():
    data = request.json
    session_id = data.get("session_id")
    question = data.get("question")
    answer = data.get("answer")

    if not session_id or not question or not answer:
        return jsonify({"error": "Missing required fields"}), 400

    session = viva_sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "email": request.user_email
    })

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # 🔥 STRICT EVALUATION PROMPT
    prompt = f"""
You are a strict engineering viva examiner.

The student may answer in Hindi, English, or regional language.

1. Detect the language of the student's answer.
2. Evaluate in the SAME language.
3. Be strict but fair.
4. Score must be between 0 and 10.

Return EXACTLY in this format:

Score: X
Feedback: ...
Correct Explanation: ...

Question:
{question}

Student Answer:
{answer}
"""

    evaluation = ask_ai(prompt)

    # ================= SAFE SCORE EXTRACTION =================
    score_match = re.search(r"Score:\s*(\d+)", evaluation)

    if score_match:
        score = int(score_match.group(1))
    else:
        score = 0  # fallback if format incorrect

    # Validate range (0–10 only)
    if score < 0:
        score = 0
    elif score > 10:
        score = 10

    # ================= UPDATE SESSION =================
    viva_sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {
                "answers": answer,
                "scores": score
            },
            "$inc": {"total_score": score}
        }
    )

    return jsonify({
        "evaluation": evaluation,
        "score": score
    })
# ================= FINAL RESULT =================
@app.route("/viva/result/<session_id>", methods=["GET"])
@token_required
def viva_result(session_id):

    session = viva_sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "email": request.user_email
    })

    if not session:
        return jsonify({"error": "Session not found"}), 404

    total = session.get("total_score", 0)
    scores = session.get("scores", [])
    count = len(scores)

    average = round(total / count, 2) if count > 0 else 0

    # Adaptive difficulty suggestion
    if average >= 8:
        next_difficulty = "Hard"
    elif average < 5:
        next_difficulty = "Easy"
    else:
        next_difficulty = "Medium"

    return jsonify({
        "topic": session.get("topic"),
        "total_score": total,
        "average_score": average,
        "questions_attempted": count,
        "next_recommended_difficulty": next_difficulty,
        "created_at": session.get("created_at")
    })

# ================= USER REPORT HISTORY =================
@app.route("/my-reports", methods=["GET"])
@token_required
def my_reports():
    reports = list(
        reports_collection.find({"email": request.user_email})
        .sort("created_at", -1)
    )

    for r in reports:
        r["_id"] = str(r["_id"])

    return jsonify(reports)


# ================= VIVA HISTORY =================
@app.route("/viva/history", methods=["GET"])
@token_required
def viva_history():
    sessions = list(
        viva_sessions_collection.find({"email": request.user_email})
        .sort("created_at", -1)
    )

    history = []

    for s in sessions:
        total = s.get("total_score", 0)
        scores = s.get("scores", [])
        count = len(scores)
        average = total / count if count > 0 else 0

        history.append({
            "id": str(s["_id"]),
            "topic": s.get("topic"),
            "average_score": round(average, 2),
            "created_at": s.get("created_at")
        })

    return jsonify(history)

# DELETE VIVA SESSION
@app.route("/viva/delete/<session_id>", methods=["DELETE"])
@token_required
def delete_viva_session(session_id):
    viva_sessions_collection.delete_one({
        "_id": ObjectId(session_id),
        "email": request.user_email
    })

    return jsonify({"message": "Session deleted"})


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)