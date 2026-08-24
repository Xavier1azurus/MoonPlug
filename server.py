from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta
from functools import wraps

import ollama
import psycopg

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash


# ============================================================
# MOONPLUG AI
# RENDER BACKEND
# ============================================================

APP_NAME = "MoonPlug AI"
APP_VERSION = "6.1.0"


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

OWNER_PASSWORD = os.environ.get(
    "MOONPLUG_OWNER_PASSWORD",
    ""
).strip()

OWNER_PASSWORD_HASH = os.environ.get(
    "MOONPLUG_OWNER_PASSWORD_HASH",
    ""
).strip()

SECRET_KEY = os.environ.get(
    "MOONPLUG_SECRET_KEY",
    ""
).strip()

FRONTEND_ORIGIN = os.environ.get(
    "FRONTEND_ORIGIN",
    "https://xavier1azurus.github.io"
).strip()

# IMPORTANT:
#
# Do NOT expect Ollama to exist at 127.0.0.1 on Render.
#
# If you have a separate Ollama server, set:
#
# OLLAMA_HOST=https://your-ollama-server.example.com
#
OLLAMA_HOST = os.environ.get(
    "OLLAMA_HOST",
    ""
).strip()

OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL",
    "llama3.2:latest"
).strip()


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)


# ============================================================
# SECRET KEY
# ============================================================

if not SECRET_KEY:

    SECRET_KEY = secrets.token_hex(32)

    print(
        "WARNING: MOONPLUG_SECRET_KEY is not configured."
    )

    print(
        "Sessions will reset when the Render instance restarts."
    )


app.config["SECRET_KEY"] = SECRET_KEY

app.config["SESSION_COOKIE_HTTPONLY"] = True

app.config["SESSION_COOKIE_SECURE"] = True

app.config["SESSION_COOKIE_SAMESITE"] = "None"

app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(
    hours=2
)


# ============================================================
# CORS
# ============================================================

allowed_origins = [
    FRONTEND_ORIGIN,
    "https://xavier1azurus.github.io",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]


# Remove duplicates
allowed_origins = list(
    dict.fromkeys(
        origin
        for origin in allowed_origins
        if origin
    )
)


CORS(
    app,
    supports_credentials=True,
    origins=allowed_origins
)


# ============================================================
# OWNER PASSWORD
# ============================================================

if OWNER_PASSWORD_HASH:

    print("✓ Owner password hash configured.")

elif OWNER_PASSWORD:

    print("✓ Owner password configured.")

else:

    print()
    print("WARNING:")
    print("MOONPLUG_OWNER_PASSWORD is NOT configured.")
    print("Owner login will not work.")
    print()


def verify_owner_password(password: str) -> bool:

    if OWNER_PASSWORD_HASH:

        try:

            return check_password_hash(
                OWNER_PASSWORD_HASH,
                password
            )

        except Exception as error:

            print(
                "Owner password hash error:",
                error
            )

            return False

    if OWNER_PASSWORD:

        return secrets.compare_digest(
            password,
            OWNER_PASSWORD
        )

    return False


# ============================================================
# LOGIN RATE LIMITING
# ============================================================

LOGIN_WINDOW_SECONDS = 300

MAX_LOGIN_ATTEMPTS = 5

login_attempts = {}


def get_client_ip():

    forwarded = request.headers.get(
        "X-Forwarded-For"
    )

    if forwarded:

        return forwarded.split(",")[0].strip()

    return request.remote_addr or "unknown"


def clean_login_attempts():

    now = datetime.now().timestamp()

    for ip in list(login_attempts.keys()):

        login_attempts[ip] = [
            timestamp
            for timestamp in login_attempts[ip]
            if now - timestamp < LOGIN_WINDOW_SECONDS
        ]

        if not login_attempts[ip]:

            del login_attempts[ip]


def rate_limited():

    clean_login_attempts()

    ip = get_client_ip()

    return (
        len(
            login_attempts.get(
                ip,
                []
            )
        )
        >= MAX_LOGIN_ATTEMPTS
    )


def record_failed_login():

    ip = get_client_ip()

    login_attempts.setdefault(
        ip,
        []
    )

    login_attempts[ip].append(
        datetime.now().timestamp()
    )


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

        print(
            "WARNING: DATABASE_URL is not configured."
        )

        return False

    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                # --------------------------------------------
                # TRAINING
                # --------------------------------------------

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS training (
                        id BIGSERIAL PRIMARY KEY,

                        question TEXT NOT NULL,

                        answer TEXT NOT NULL,

                        category TEXT NOT NULL
                            DEFAULT 'general',

                        created TIMESTAMPTZ NOT NULL
                            DEFAULT NOW(),

                        uses BIGINT NOT NULL
                            DEFAULT 0
                    )
                    """
                )


                # --------------------------------------------
                # CONVERSATIONS
                # --------------------------------------------

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS conversations (
                        id BIGSERIAL PRIMARY KEY,

                        session_id TEXT,

                        message TEXT NOT NULL,

                        response TEXT NOT NULL,

                        created TIMESTAMPTZ NOT NULL
                            DEFAULT NOW()
                    )
                    """
                )


                # --------------------------------------------
                # SETTINGS
                # --------------------------------------------

                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS app_settings (
                        id INTEGER PRIMARY KEY,

                        minimum_score DOUBLE PRECISION
                            NOT NULL DEFAULT 0.30,

                        remember_conversations BOOLEAN
                            NOT NULL DEFAULT TRUE,

                        case_sensitive BOOLEAN
                            NOT NULL DEFAULT FALSE
                    )
                    """
                )


                # --------------------------------------------
                # DEFAULT SETTINGS
                # --------------------------------------------

                cursor.execute(
                    """
                    INSERT INTO app_settings (
                        id,
                        minimum_score,
                        remember_conversations,
                        case_sensitive
                    )
                    VALUES (
                        1,
                        0.30,
                        TRUE,
                        FALSE
                    )
                    ON CONFLICT (id)
                    DO NOTHING
                    """
                )

            connection.commit()

        print("✓ PostgreSQL database ready.")

        return True

    except Exception as error:

        print(
            "Database initialization failed:",
            error
        )

        return False


# ============================================================
# OLLAMA
# ============================================================

def ollama_configured():

    return bool(OLLAMA_HOST)


def get_ollama_client():

    if not OLLAMA_HOST:

        raise RuntimeError(
            "OLLAMA_HOST is not configured."
        )

    return ollama.Client(
        host=OLLAMA_HOST
    )


def ollama_available():

@app.route("/api/owner/ollama/pull", methods=["POST"])
@owner_required
def pull_ollama_model():

    try:

        client = get_ollama_client()

        client.pull("tinyllama")

        return jsonify({
            "success": True,
            "model": "tinyllama",
            "message": "TinyLlama downloaded successfully."
        })

    except Exception as error:

        print(
            "Ollama model pull failed:",
            error
        )

        return jsonify({
            "success": False,
            "error": str(error)
        }), 503


    if not ollama_configured():

        return False

    try:

        client = get_ollama_client()

        client.list()

        return True

    except Exception as error:

        print(
            "Ollama unavailable:",
            error
        )

        return False


# ============================================================
# OWNER AUTHENTICATION
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
                "error":
                    "Owner authentication required."
            }), 401

        return function(
            *args,
            **kwargs
        )

    return wrapper


# ============================================================
# TRAINING HELPERS
# ============================================================

def get_all_training():

    if not database_available():

        return []

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

                return cursor.fetchall()

    except Exception as error:

        print(
            "Could not load training:",
            error
        )

        return []


def get_minimum_score():

    if not database_available():

        return 0.30

    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT minimum_score
                    FROM app_settings
                    WHERE id = 1
                    """
                )

                result = cursor.fetchone()

                if result:

                    return float(
                        result["minimum_score"]
                    )

    except Exception as error:

        print(
            "Could not load minimum score:",
            error
        )

    return 0.30


def find_best_training_match(message):

    if not database_available():

        return None

    message_clean = (
        message.strip().lower()
    )

    if not message_clean:

        return None

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
                        uses
                    FROM training
                    ORDER BY id ASC
                    """
                )

                training = cursor.fetchall()


        message_words = set(
            message_clean.split()
        )

        best_match = None

        best_score = 0.0


        for item in training:

            stored_question = (
                item["question"] or ""
            ).strip().lower()

            if not stored_question:

                continue


            stored_words = set(
                stored_question.split()
            )

            if not stored_words:

                continue


            intersection = (
                message_words &
                stored_words
            )

            union = (
                message_words |
                stored_words
            )

            if not union:

                continue


            score = (
                len(intersection) /
                len(union)
            )


            if message_clean == stored_question:

                score = 1.0


            if score > best_score:

                best_score = score

                best_match = item


        if not best_match:

            return None


        if best_score < get_minimum_score():

            return None


        # Increase usage counter

        try:

            with get_db() as connection:

                with connection.cursor() as cursor:

                    cursor.execute(
                        """
                        UPDATE training
                        SET uses = uses + 1
                        WHERE id = %s
                        """,
                        (
                            best_match["id"],
                        )
                    )

                connection.commit()

        except Exception as error:

            print(
                "Could not update training usage:",
                error
            )


        best_match["score"] = best_score

        return best_match


    except Exception as error:

        print(
            "Training matching failed:",
            error
        )

        return None


# ============================================================
# SAVE CONVERSATION
# ============================================================

def save_conversation(
    message,
    response
):

    if not database_available():

        return

    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO conversations (
                        session_id,
                        message,
                        response
                    )
                    VALUES (
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        session.get(
                            "session_id"
                        ),
                        message,
                        response
                    )
                )

            connection.commit()

    except Exception as error:

        print(
            "Could not save conversation:",
            error
        )


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    database_status = (
        "configured"
        if database_available()
        else "not_configured"
    )

    ollama_status = (
        "configured"
        if ollama_configured()
        else "not_configured"
    )

    return jsonify({
        "success": True,

        "app": APP_NAME,

        "version": APP_VERSION,

        "status": "online",

        "database": database_status,

        "ollama_host": (
            OLLAMA_HOST
            if OLLAMA_HOST
            else None
        ),

        "ollama_model": OLLAMA_MODEL,

        "ollama_configured":
            ollama_configured(),

        "time":
            datetime.now().isoformat()
    })


# ============================================================
# OWNER LOGIN
# ============================================================

@app.route(
    "/api/owner/login",
    methods=["POST"]
)
def owner_login():

    if rate_limited():

        return jsonify({
            "success": False,
            "error":
                "Too many login attempts. "
                "Please wait a few minutes."
        }), 429


    if not OWNER_PASSWORD and not OWNER_PASSWORD_HASH:

        return jsonify({
            "success": False,
            "error":
                "Owner authentication is "
                "not configured on the server."
        }), 503


    data = request.get_json(
        silent=True
    )


    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400


    password = data.get(
        "password",
        ""
    )


    if not isinstance(password, str):

        record_failed_login()

        return jsonify({
            "success": False,
            "error":
                "Invalid password."
        }), 401


    password = password.strip()


    if not password or len(password) > 256:

        record_failed_login()

        return jsonify({
            "success": False,
            "error":
                "Invalid password."
        }), 401


    if not verify_owner_password(password):

        record_failed_login()

        return jsonify({
            "success": False,
            "error":
                "Incorrect owner code."
        }), 401


    login_attempts.pop(
        get_client_ip(),
        None
    )


    session.clear()

    session.permanent = True

    session["owner_authenticated"] = True

    session["login_time"] = (
        datetime.now().isoformat()
    )

    session["session_id"] = (
        secrets.token_hex(16)
    )


    return jsonify({
        "success": True,
        "authenticated": True,
        "message":
            "Owner login successful."
    })


# ============================================================
# OWNER SESSION
# ============================================================

@app.route(
    "/api/owner/session",
    methods=["GET"]
)
def owner_session():

    return jsonify({
        "success": True,

        "authenticated":
            session.get(
                "owner_authenticated",
                False
            )
    })


# ============================================================
# OWNER LOGOUT
# ============================================================

@app.route(
    "/api/owner/logout",
    methods=["POST"]
)
def owner_logout():

    session.clear()

    return jsonify({
        "success": True,
        "authenticated": False
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

    training = get_all_training()

    categories = {}

    total_uses = 0


    for item in training:

        category = (
            item.get("category")
            or "general"
        )

        categories[category] = (
            categories.get(
                category,
                0
            ) + 1
        )


        try:

            total_uses += int(
                item.get(
                    "uses",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            pass


    chats = 0


    if database_available():

        try:

            with get_db() as connection:

                with connection.cursor() as cursor:

                    cursor.execute(
                        """
                        SELECT COUNT(*) AS count
                        FROM conversations
                        """
                    )

                    result = cursor.fetchone()

                    chats = int(
                        result["count"]
                    )

        except Exception as error:

            print(
                "Could not count chats:",
                error
            )


    return jsonify({
        "success": True,

        "stats": {
            "users": 0,
            "chats": chats,
            "training": len(training),
            "responseUses": total_uses,
            "categories": categories
        },

        "server": {
            "status": "online",
            "version": APP_VERSION,
            "database":
                database_available(),
            "ollama":
                ollama_available(),
            "ollamaConfigured":
                ollama_configured(),
            "model":
                OLLAMA_MODEL
        }
    })


# ============================================================
# OWNER USERS
# ============================================================

@app.route(
    "/api/owner/users",
    methods=["GET"]
)
@owner_required
def owner_users():

    # Public accounts aren't implemented yet.

    return jsonify({
        "success": True,
        "users": []
    })


# ============================================================
# GET TRAINING
# ============================================================

@app.route(
    "/api/owner/training",
    methods=["GET"]
)
@owner_required
def get_training():

    return jsonify({
        "success": True,
        "training":
            get_all_training()
    })


# ============================================================
# ADD TRAINING
# ============================================================

@app.route(
    "/api/owner/training",
    methods=["POST"]
)
@owner_required
def add_training():

    if not database_available():

        return jsonify({
            "success": False,
            "error":
                "Database unavailable."
        }), 503


    data = request.get_json(
        silent=True
    )


    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400


    question = data.get(
        "question",
        ""
    )

    answer = data.get(
        "answer",
        ""
    )

    category = data.get(
        "category",
        "general"
    )


    if not isinstance(question, str):

        return jsonify({
            "success": False,
            "error":
                "Question must be text."
        }), 400


    if not isinstance(answer, str):

        return jsonify({
            "success": False,
            "error":
                "Answer must be text."
        }), 400


    if not isinstance(category, str):

        category = "general"


    question = question.strip()

    answer = answer.strip()

    category = (
        category.strip()
        or "general"
    )


    if not question:

        return jsonify({
            "success": False,
            "error":
                "Question cannot be empty."
        }), 400


    if not answer:

        return jsonify({
            "success": False,
            "error":
                "Answer cannot be empty."
        }), 400


    if len(question) > 2000:

        return jsonify({
            "success": False,
            "error":
                "Question is too long."
        }), 400


    if len(answer) > 10000:

        return jsonify({
            "success": False,
            "error":
                "Answer is too long."
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

        print(
            "Could not save training:",
            error
        )

        return jsonify({
            "success": False,
            "error":
                "Could not save training data."
        }), 500


# ============================================================
# GENERATE TRAINING WITH OLLAMA
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
            "error":
                "Database unavailable."
        }), 503


    if not ollama_configured():

        return jsonify({
            "success": False,
            "error":
                "Ollama is not configured on Render. "
                "Set OLLAMA_HOST to a reachable Ollama server."
        }), 503


    data = request.get_json(
        silent=True
    )


    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error":
                "Invalid JSON request."
        }), 400


    category = data.get(
        "category",
        ""
    )


    if not isinstance(category, str):

        return jsonify({
            "success": False,
            "error":
                "Category must be text."
        }), 400


    category = category.strip()


    if not category:

        return jsonify({
            "success": False,
            "error":
                "Category cannot be empty."
        }), 400


    try:

        amount = int(
            data.get(
                "amount",
                10
            )
        )

    except (
        ValueError,
        TypeError
    ):

        return jsonify({
            "success": False,
            "error":
                "Amount must be a number."
        }), 400


    amount = max(
        1,
        min(
            amount,
            50
        )
    )


    # --------------------------------------------------------
    # CONNECT TO OLLAMA
    # --------------------------------------------------------

    try:

        client = get_ollama_client()

        client.list()

    except Exception as error:

        print(
            "OLLAMA CONNECTION ERROR:",
            error
        )

        return jsonify({
            "success": False,
            "error":
                "MoonPlug could not connect to Ollama. "
                "Check OLLAMA_HOST and make sure the Ollama "
                "server is reachable from Render."
        }), 503


    # --------------------------------------------------------
    # PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are MoonPlug AI's training generator.

Generate exactly {amount}
question-and-answer training examples
about this category:

{category}

Rules:

- Questions must be different.
- Answers must be different.
- Cover different parts of the category.
- Give useful and accurate information.
- Do not repeat information.
- Do not use markdown.
- Return ONLY valid JSON.

Return:

{{
  "training": [
    {{
      "question": "Question",
      "answer": "Answer"
    }}
  ]
}}
"""


    # --------------------------------------------------------
    # GENERATE
    # --------------------------------------------------------

    try:

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
            result
            .get("message", {})
            .get("content", "")
        )


        if not content:

            raise ValueError(
                "Ollama returned an empty response."
            )


        generated = json.loads(
            content
        )


        training_items = generated.get(
            "training",
            []
        )


        if not isinstance(
            training_items,
            list
        ):

            raise ValueError(
                "Invalid training format."
            )


    except Exception as error:

        print(
            "OLLAMA TRAINER ERROR:",
            error
        )

        return jsonify({
            "success": False,
            "error":
                "Ollama could not generate "
                "the training data."
        }), 500


    # --------------------------------------------------------
    # SAVE GENERATED TRAINING
    # --------------------------------------------------------

    saved = []


    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                for item in training_items:

                    if not isinstance(
                        item,
                        dict
                    ):

                        continue


                    question = str(
                        item.get(
                            "question",
                            ""
                        )
                    ).strip()


                    answer = str(
                        item.get(
                            "answer",
                            ""
                        )
                    ).strip()


                    if not question:

                        continue


                    if not answer:

                        continue


                    if len(question) > 2000:

                        continue


                    if len(answer) > 10000:

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

            "generated":
                len(training_items),

            "saved":
                len(saved),

            "training":
                saved,

            "message":
                f"Generated and saved "
                f"{len(saved)} training examples."
        }), 201


    except Exception as error:

        print(
            "TRAINING DATABASE ERROR:",
            error
        )

        return jsonify({
            "success": False,
            "error":
                "Training was generated, "
                "but could not be saved."
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
            "error":
                "Database unavailable."
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
                    (
                        training_id,
                    )
                )

                deleted = cursor.fetchone()

            connection.commit()


        if not deleted:

            return jsonify({
                "success": False,
                "error":
                    "Training example not found."
            }), 404


        return jsonify({
            "success": True,
            "message":
                "Training example deleted."
        })


    except Exception as error:

        print(
            "Could not delete training:",
            error
        )

        return jsonify({
            "success": False,
            "error":
                "Could not delete training."
        }), 500


# ============================================================
# CHAT
# ============================================================

@app.route(
    "/api/chat",
    methods=["POST"]
)
def chat():

    data = request.get_json(
        silent=True
    )


    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400


    message = data.get(
        "message",
        ""
    )


    if not isinstance(message, str):

        return jsonify({
            "success": False,
            "error":
                "Message must be text."
        }), 400


    message = message.strip()


    if not message:

        return jsonify({
            "success": False,
            "error":
                "Message cannot be empty."
        }), 400


    # ========================================================
    # 1. CHECK TRAINED KNOWLEDGE FIRST
    # ========================================================

    match = find_best_training_match(
        message
    )


    if match:

        response = match["answer"]

        source = "trained_knowledge"

        training_id = match["id"]

        score = match.get(
            "score",
            0
        )


        save_conversation(
            message,
            response
        )


        return jsonify({
            "success": True,
            "response": response,
            "source": source,
            "trainingId": training_id,
            "matchScore": score
        })


    # ========================================================
    # 2. USE OLLAMA IF CONFIGURED
    # ========================================================

    if ollama_configured():

        try:

            client = get_ollama_client()


            # Build conversation history

            history = data.get(
                "history",
                []
            )


            messages = [
                {
                    "role": "system",
                    "content":
                        "You are MoonPlug AI, "
                        "a helpful AI assistant. "
                        "Give clear and useful answers."
                }
            ]


            if isinstance(
                history,
                list
            ):

                for item in history[-20:]:

                    if not isinstance(
                        item,
                        dict
                    ):

                        continue


                    role = item.get(
                        "role"
                    )

                    content = item.get(
                        "content"
                    )


                    if role not in (
                        "user",
                        "assistant"
                    ):

                        continue


                    if not isinstance(
                        content,
                        str
                    ):

                        continue


                    if not content.strip():

                        continue


                    messages.append({
                        "role": role,
                        "content":
                            content[:10000]
                    })


            # Make sure current message is included

            if not messages or (
                messages[-1].get("role")
                != "user"
                or messages[-1].get("content")
                != message
            ):

                messages.append({
                    "role": "user",
                    "content": message
                })


            result = client.chat(
                model=OLLAMA_MODEL,
                messages=messages
            )


            response = (
                result
                .get("message", {})
                .get("content", "")
                .strip()
            )


            if response:

                save_conversation(
                    message,
                    response
                )


                return jsonify({
                    "success": True,
                    "response": response,
                    "source":
                        "ollama",
                    "trainingId": None,
                    "matchScore": 0
                })


        except Exception as error:

            print(
                "OLLAMA CHAT ERROR:",
                error
            )


    # ========================================================
    # 3. FALLBACK
    # ========================================================

    response = (
        "I don't know that yet. "
        "You can teach MoonPlug about "
        "this through the Trainer."
    )


    save_conversation(
        message,
        response
    )


    return jsonify({
        "success": True,
        "response": response,
        "source": "fallback",
        "trainingId": None,
        "matchScore": 0
    })


# ============================================================
# OWNER SETTINGS
# ============================================================

@app.route(
    "/api/owner/settings",
    methods=["GET"]
)
@owner_required
def get_settings():

    settings = {
        "minimum_score": 0.30,
        "remember_conversations": True,
        "case_sensitive": False
    }


    if database_available():

        try:

            with get_db() as connection:

                with connection.cursor() as cursor:

                    cursor.execute(
                        """
                        SELECT
                            minimum_score,
                            remember_conversations,
                            case_sensitive
                        FROM app_settings
                        WHERE id = 1
                        """
                    )


                    result = cursor.fetchone()


                    if result:

                        settings = {
                            "minimum_score":
                                float(
                                    result[
                                        "minimum_score"
                                    ]
                                ),

                            "remember_conversations":
                                bool(
                                    result[
                                        "remember_conversations"
                                    ]
                                ),

                            "case_sensitive":
                                bool(
                                    result[
                                        "case_sensitive"
                                    ]
                                )
                        }


        except Exception as error:

            print(
                "Could not load settings:",
                error
            )


    return jsonify({
        "success": True,
        "settings": settings
    })


# ============================================================
# UPDATE SETTINGS
# ============================================================

@app.route(
    "/api/owner/settings",
    methods=["POST"]
)
@owner_required
def update_settings():

    if not database_available():

        return jsonify({
            "success": False,
            "error":
                "Database unavailable."
        }), 503


    data = request.get_json(
        silent=True
    )


    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400


    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                # --------------------------------------------
                # MINIMUM SCORE
                # --------------------------------------------

                if "minimum_score" in data:

                    minimum_score = float(
                        data[
                            "minimum_score"
                        ]
                    )


                    if not 0 <= minimum_score <= 1:

                        return jsonify({
                            "success": False,
                            "error":
                                "Minimum score must "
                                "be between 0 and 1."
                        }), 400


                    cursor.execute(
                        """
                        UPDATE app_settings
                        SET minimum_score = %s
                        WHERE id = 1
                        """,
                        (
                            minimum_score,
                        )
                    )


                # --------------------------------------------
                # REMEMBER CONVERSATIONS
                # --------------------------------------------

                if "remember_conversations" in data:

                    value = data[
                        "remember_conversations"
                    ]


                    if not isinstance(
                        value,
                        bool
                    ):

                        return jsonify({
                            "success": False,
                            "error":
                                "remember_conversations "
                                "must be true or false."
                        }), 400


                    cursor.execute(
                        """
                        UPDATE app_settings
                        SET remember_conversations = %s
                        WHERE id = 1
                        """,
                        (
                            value,
                        )
                    )


                # --------------------------------------------
                # CASE SENSITIVE
                # --------------------------------------------

                if "case_sensitive" in data:

                    value = data[
                        "case_sensitive"
                    ]


                    if not isinstance(
                        value,
                        bool
                    ):

                        return jsonify({
                            "success": False,
                            "error":
                                "case_sensitive "
                                "must be true or false."
                        }), 400


                    cursor.execute(
                        """
                        UPDATE app_settings
                        SET case_sensitive = %s
                        WHERE id = 1
                        """,
                        (
                            value,
                        )
                    )


            connection.commit()


        return jsonify({
            "success": True,
            "message":
                "Settings updated."
        })


    except Exception as error:

        print(
            "Could not update settings:",
            error
        )


        return jsonify({
            "success": False,
            "error":
                "Could not update settings."
        }), 500


# ============================================================
# OWNER STATUS
# ============================================================

@app.route(
    "/api/owner/status",
    methods=["GET"]
)
@owner_required
def owner_status():

    return jsonify({
        "success": True,

        "ownerAuthenticated": True,

        "server":
            APP_NAME,

        "version":
            APP_VERSION,

        "status":
            "online",

        "database":
            database_available(),

        "ollamaConfigured":
            ollama_configured(),

        "ollamaHost":
            OLLAMA_HOST
            if OLLAMA_HOST
            else None,

        "ollamaModel":
            OLLAMA_MODEL
    })


# ============================================================
# ROOT
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def root():

    return jsonify({
        "success": True,
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "online"
    })


# ============================================================
# 404
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "error":
            "API endpoint not found."
    }), 404


# ============================================================
# 405
# ============================================================

@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({
        "success": False,
        "error":
            "HTTP method not allowed."
    }), 405


# ============================================================
# 500
# ============================================================

@app.errorhandler(500)
def internal_error(error):

    print(
        "Internal server error:",
        error
    )

    return jsonify({
        "success": False,
        "error":
            "Internal server error."
    }), 500


# ============================================================
# STARTUP
# ============================================================

def startup():

    print()
    print("=" * 60)
    print("                  MOONPLUG AI")
    print("                RENDER BACKEND")
    print("=" * 60)
    print()

    print(
        "Version:",
        APP_VERSION
    )

    print(
        "Database configured:",
        database_available()
    )

    print(
        "Owner configured:",
        bool(
            OWNER_PASSWORD or
            OWNER_PASSWORD_HASH
        )
    )

    print(
        "Ollama configured:",
        ollama_configured()
    )

    if ollama_configured():

        print(
            "Ollama host:",
            OLLAMA_HOST
        )

        print(
            "Ollama model:",
            OLLAMA_MODEL
        )

    else:

        print(
            "Ollama host: NOT CONFIGURED"
        )

    print()

    initialize_database()

    print()

    print(
        "MoonPlug backend ready."
    )

    print()


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if __name__ == "__main__":

    startup()

    port = int(
        os.environ.get(
            "PORT",
            "5000"
        )
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )


# ============================================================
# RENDER / GUNICORN
# ============================================================

else:

    initialize_database()
