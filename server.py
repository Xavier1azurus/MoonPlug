from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta
from functools import wraps

import ollama
import psycopg
from psycopg.rows import dict_row

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash


# ============================================================
# CONFIG
# ============================================================

APP_NAME = "MoonPlug AI"
APP_VERSION = "5.0.0"

OLLAMA_HOST = os.environ.get("OLLAMA_HOST")
OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL",
    "llama3.2:latest"
)

DATABASE_URL = os.environ.get("DATABASE_URL")
OWNER_PASSWORD = os.environ.get("MOONPLUG_OWNER_PASSWORD")
SECRET_KEY = os.environ.get("MOONPLUG_SECRET_KEY")

FRONTEND_ORIGIN = os.environ.get(
    "FRONTEND_ORIGIN",
    "https://xavier1azurus.github.io"
)


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    print("WARNING: MOONPLUG_SECRET_KEY is not set.")

app.config["SECRET_KEY"] = SECRET_KEY
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=2)

CORS(
    app,
    supports_credentials=True,
    origins=[
        FRONTEND_ORIGIN,
        "https://xavier1azurus.github.io",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
)


# ============================================================
# OWNER PASSWORD
# ============================================================

OWNER_PASSWORD_HASH = None

if OWNER_PASSWORD:
    OWNER_PASSWORD_HASH = generate_password_hash(
        OWNER_PASSWORD
    )
else:
    print("WARNING: MOONPLUG_OWNER_PASSWORD is not configured.")


# ============================================================
# DATABASE
# ============================================================

def database_available():
    return bool(DATABASE_URL)


def get_db():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured."
        )

    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row
    )


def initialize_database():

    if not database_available():
        print("WARNING: DATABASE_URL is not configured.")
        return False

    try:
        with get_db() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS training (
                        id BIGSERIAL PRIMARY KEY,
                        question TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        category TEXT NOT NULL DEFAULT 'general',
                        created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        uses BIGINT NOT NULL DEFAULT 0
                    )
                    """
                )

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS conversations (
                        id BIGSERIAL PRIMARY KEY,
                        session_id TEXT,
                        message TEXT,
                        response TEXT,
                        created TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                    """
                )

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS app_settings (
                        id INTEGER PRIMARY KEY,
                        minimum_score DOUBLE PRECISION
                            NOT NULL DEFAULT 0.30
                    )
                    """
                )

                cursor.execute(
                    """
                    INSERT INTO app_settings (
                        id,
                        minimum_score
                    )
                    VALUES (
                        1,
                        0.30
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                )

            connection.commit()

        print("Database ready.")
        return True

    except Exception as error:
        print(f"Database initialization failed: {error}")
        return False


# ============================================================
# OLLAMA
# ============================================================

def ollama_available():

    if not OLLAMA_HOST:
        print("OLLAMA_HOST is not configured.")
        return False

    try:
        client = ollama.Client(
            host=OLLAMA_HOST
        )

        client.list()

        return True

    except Exception as error:
        print(f"Ollama is unavailable: {error}")
        return False


def get_ollama_client():

    if not OLLAMA_HOST:
        raise RuntimeError(
            "OLLAMA_HOST is not configured."
        )

    return ollama.Client(
        host=OLLAMA_HOST
    )


# ============================================================
# OWNER AUTH
# ============================================================

def owner_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        if not session.get(
            "owner_authenticated",
            False
        ):
            return jsonify({
                "success": False,
                "authenticated": False,
                "error": "Owner authentication required."
            }), 401

        return function(*args, **kwargs)

    return wrapper


# ============================================================
# HEALTH
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "online",
        "database": (
            "configured"
            if database_available()
            else "not_configured"
        ),
        "ollama": (
            "configured"
            if OLLAMA_HOST
            else "not_configured"
        ),
        "model": OLLAMA_MODEL,
        "time": datetime.now().isoformat(),
    })


# ============================================================
# OWNER LOGIN
# ============================================================

@app.route("/api/owner/login", methods=["POST"])
def owner_login():

    if OWNER_PASSWORD_HASH is None:
        return jsonify({
            "success": False,
            "error": (
                "Owner authentication is not "
                "configured on the server."
            )
        }), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request."
        }), 400

    password = data.get("password", "")

    if not isinstance(password, str):
        return jsonify({
            "success": False,
            "error": "Invalid password."
        }), 401

    if not check_password_hash(
        OWNER_PASSWORD_HASH,
        password
    ):
        return jsonify({
            "success": False,
            "error": "Incorrect owner code."
        }), 401

    session.clear()
    session.permanent = True
    session["owner_authenticated"] = True
    session["session_id"] = secrets.token_hex(16)

    return jsonify({
        "success": True,
        "authenticated": True,
        "message": "Owner login successful."
    })


# ============================================================
# OWNER SESSION
# ============================================================

@app.route("/api/owner/session", methods=["GET"])
def owner_session():

    return jsonify({
        "success": True,
        "authenticated": session.get(
            "owner_authenticated",
            False
        )
    })


# ============================================================
# OWNER LOGOUT
# ============================================================

@app.route("/api/owner/logout", methods=["POST"])
def owner_logout():

    session.clear()

    return jsonify({
        "success": True,
        "authenticated": False
    })


# ============================================================
# GET TRAINING
# ============================================================

@app.route("/api/owner/training", methods=["GET"])
@owner_required
def get_training():

    if not database_available():
        return jsonify({
            "success": False,
            "error": "Database unavailable."
        }), 503

    try:
        with get_db() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        question,
                        answer,
                        category,
                        created,
                        uses
                    FROM training
                    ORDER BY id DESC
                    """
                )

                training = cursor.fetchall()

        return jsonify({
            "success": True,
            "training": training
        })

    except Exception as error:

        print(f"Could not load training: {error}")

        return jsonify({
            "success": False,
            "error": "Could not load training."
        }), 500


# ============================================================
# ADD MANUAL TRAINING
# ============================================================

@app.route("/api/owner/training", methods=["POST"])
@owner_required
def add_training():

    if not database_available():
        return jsonify({
            "success": False,
            "error": "Database unavailable."
        }), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request."
        }), 400

    question = str(
        data.get("question", "")
    ).strip()

    answer = str(
        data.get("answer", "")
    ).strip()

    category = str(
        data.get("category", "general")
    ).strip() or "general"

    if not question or not answer:
        return jsonify({
            "success": False,
            "error": (
                "Question and answer are required."
            )
        }), 400

    try:
        with get_db() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO training (
                        question,
                        answer,
                        category
                    )
                    VALUES (
                        %s,
                        %s,
                        %s
                    )
                    RETURNING
                        id,
                        question,
                        answer,
                        category,
                        created,
                        uses
                    """,
                    (
                        question,
                        answer,
                        category
                    )
                )

                saved = cursor.fetchone()

            connection.commit()

        return jsonify({
            "success": True,
            "training": saved
        }), 201

    except Exception as error:

        print(f"Could not save training: {error}")

        return jsonify({
            "success": False,
            "error": "Could not save training."
        }), 500


# ============================================================
# AUTOMATIC OLLAMA TRAINER
# ============================================================

@app.route(
    "/api/owner/training/generate",
    methods=["POST"]
)
@owner_required
def generate_training():

    if not database_available():
        return jsonify({
            "success": False,
            "error": "Database unavailable."
        }), 503

    if not OLLAMA_HOST:
        return jsonify({
            "success": False,
            "error": (
                "OLLAMA_HOST is not configured."
            )
        }), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request."
        }), 400

    category = str(
        data.get("category", "")
    ).strip()

    if not category:
        return jsonify({
            "success": False,
            "error": "Category cannot be empty."
        }), 400

    try:
        amount = int(
            data.get("amount", 10)
        )
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Amount must be a number."
        }), 400

    amount = max(1, min(amount, 50))

    prompt = f"""
Generate exactly {amount} different training
question and answer pairs about this category:

{category}

Return ONLY valid JSON in exactly this format:

{{
  "training": [
    {{
      "question": "Question here",
      "answer": "Answer here"
    }}
  ]
}}

Rules:
- Every question must be different.
- Every answer must be different.
- Be accurate and useful.
- Cover different parts of the category.
- Do not use markdown.
"""

    try:
        client = get_ollama_client()

        result = client.chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            format="json"
        )

        content = (
            result.get("message", {})
            .get("content", "")
        )

        if not content:
            raise ValueError(
                "Ollama returned an empty response."
            )

        generated = json.loads(content)

        training_items = generated.get(
            "training",
            []
        )

        if not isinstance(training_items, list):
            raise ValueError(
                "Invalid training format."
            )

    except Exception as error:

        print(f"Ollama generation error: {error}")

        return jsonify({
            "success": False,
            "error": (
                "Ollama could not generate "
                "training data."
            )
        }), 500

    saved = []

    try:
        with get_db() as connection:
            with connection.cursor() as cursor:

                for item in training_items:

                    if not isinstance(item, dict):
                        continue

                    question = str(
                        item.get("question", "")
                    ).strip()

                    answer = str(
                        item.get("answer", "")
                    ).strip()

                    if not question or not answer:
                        continue

                    cursor.execute(
                        """
                        INSERT INTO training (
                            question,
                            answer,
                            category
                        )
                        VALUES (
                            %s,
                            %s,
                            %s
                        )
                        RETURNING
                            id,
                            question,
                            answer,
                            category,
                            created,
                            uses
                        """,
                        (
                            question,
                            answer,
                            category
                        )
                    )

                    row = cursor.fetchone()

                    if row:
                        saved.append(row)

            connection.commit()

        return jsonify({
            "success": True,
            "category": category,
            "generated": len(training_items),
            "saved": len(saved),
            "training": saved,
            "message": (
                f"Generated and saved "
                f"{len(saved)} training examples."
            )
        }), 201

    except Exception as error:

        print(
            f"Training database error: {error}"
        )

        return jsonify({
            "success": False,
            "error": (
                "Training was generated but "
                "could not be saved."
            )
        }), 500


# ============================================================
# DELETE TRAINING
# ============================================================

@app.route(
    "/api/owner/training/<int:training_id>",
    methods=["DELETE"]
)
@owner_required
def delete_training(training_id):

    if not database_available():
        return jsonify({
            "success": False,
            "error": "Database unavailable."
        }), 503

    try:
        with get_db() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    DELETE FROM training
                    WHERE id = %s
                    RETURNING id
                    """,
                    (training_id,)
                )

                deleted = cursor.fetchone()

            connection.commit()

        if not deleted:
            return jsonify({
                "success": False,
                "error": "Training not found."
            }), 404

        return jsonify({
            "success": True
        })

    except Exception as error:

        print(f"Delete training error: {error}")

        return jsonify({
            "success": False,
            "error": "Could not delete training."
        }), 500


# ============================================================
# CHAT
# ============================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request."
        }), 400

    message = str(
        data.get("message", "")
    ).strip()

    if not message:
        return jsonify({
            "success": False,
            "error": "Message cannot be empty."
        }), 400

    return jsonify({
        "success": True,
        "response": (
            "MoonPlug chat is connected. "
            "AI chat generation can be added next."
        )
    })


# ============================================================
# OWNER DASHBOARD
# ============================================================

@app.route(
    "/api/owner/dashboard",
    methods=["GET"]
)
@owner_required
def owner_dashboard():

    training_count = 0

    if database_available():
        try:
            with get_db() as connection:
                with connection.cursor() as cursor:

                    cursor.execute(
                        "SELECT COUNT(*) AS count FROM training"
                    )

                    result = cursor.fetchone()
                    training_count = int(result["count"])

        except Exception as error:
            print(f"Dashboard error: {error}")

    return jsonify({
        "success": True,
        "stats": {
            "users": 0,
            "chats": 0,
            "training": training_count
        }
    })


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "error": "API endpoint not found."
    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({
        "success": False,
        "error": "Internal server error."
    }), 500


# ============================================================
# STARTUP
# ============================================================

print("=" * 50)
print("MOONPLUG AI SERVER")
print(f"Version: {APP_VERSION}")
print(f"Database configured: {database_available()}")
print(f"Ollama host configured: {bool(OLLAMA_HOST)}")
print(f"Ollama model: {OLLAMA_MODEL}")
print("=" * 50)

initialize_database()


# ============================================================
# LOCAL START
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                "5000"
            )
        ),
        debug=False
    )
