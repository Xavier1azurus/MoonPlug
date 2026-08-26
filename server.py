
from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta
from functools import wraps

import httpx
import ollama
import psycopg

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash


# ============================================================
# MOONPLUG AI
# RENDER BACKEND
# ============================================================

APP_NAME = "MoonPlug AI"
APP_VERSION = "7.1.0"


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    ""
).strip()

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


# ============================================================
# OLLAMA / PROXY
# ============================================================

OLLAMA_HOST = os.environ.get(
    "OLLAMA_HOST",
    ""
).strip().rstrip("/")

OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL",
    "llama3.2:latest"
).strip()

# IMPORTANT:
# This is the secret key used by your Ollama proxy.
#
# Render environment variable:
#
# MOONPLUG_PROXY_KEY
#
# The key is NEVER hard-coded into this file.
PROXY_KEY = os.environ.get(
    "MOONPLUG_PROXY_KEY",
    ""
).strip()

PROXY_HEADER_NAME = "X-MoonPlug-Key"


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
# PROXY CONFIGURATION
# ============================================================

def proxy_configured() -> bool:
    return bool(
        OLLAMA_HOST and PROXY_KEY
    )


def get_proxy_headers() -> dict[str, str]:
    """
    Headers sent to the external Ollama proxy.

    The proxy key is added to EVERY Ollama request.
    """

    if not PROXY_KEY:

        raise RuntimeError(
            "MOONPLUG_PROXY_KEY is not configured."
        )

    return {
        PROXY_HEADER_NAME: PROXY_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def get_ollama_client():
    """
    Creates an Ollama client with the proxy
    authentication header attached.

    Every request made by this client therefore
    includes X-MoonPlug-Key.
    """

    if not OLLAMA_HOST:

        raise RuntimeError(
            "OLLAMA_HOST is not configured."
        )

    if not PROXY_KEY:

        raise RuntimeError(
            "MOONPLUG_PROXY_KEY is not configured."
        )

    return ollama.Client(
        host=OLLAMA_HOST,
        headers=get_proxy_headers()
    )


# ============================================================
# DIRECT PROXY REQUEST
# ============================================================

def proxy_request(
    method: str,
    endpoint: str,
    *,
    json_data=None,
    timeout: float = 60.0
):
    """
    Makes a direct HTTP request to the Ollama proxy.

    This is used for endpoints such as /api/tags
    where we want complete control over the headers.
    """

    if not OLLAMA_HOST:

        raise RuntimeError(
            "OLLAMA_HOST is not configured."
        )

    if not PROXY_KEY:

        raise RuntimeError(
            "MOONPLUG_PROXY_KEY is not configured."
        )

    url = (
        OLLAMA_HOST.rstrip("/")
        + "/"
        + endpoint.lstrip("/")
    )

    headers = get_proxy_headers()

    with httpx.Client(
        timeout=timeout,
        follow_redirects=True
    ) as client:

        response = client.request(
            method.upper(),
            url,
            headers=headers,
            json=json_data
        )

    return response


# ============================================================
# PROXY TAGS
# ============================================================

def get_ollama_models():
    """
    Calls /api/tags directly.

    The proxy key is explicitly attached.
    """

    try:

        response = proxy_request(
            "GET",
            "/api/tags",
            timeout=30
        )

        if response.status_code >= 400:

            raise RuntimeError(
                f"Proxy returned HTTP "
                f"{response.status_code}: "
                f"{response.text[:500]}"
            )

        data = response.json()

        models = []

        for item in data.get(
            "models",
            []
        ):

            if not isinstance(
                item,
                dict
            ):

                continue

            name = (
                item.get("name")
                or item.get("model")
            )

            if name:

                models.append(
                    str(name)
                )

        return models

    except Exception as error:

        print(
            "Could not get Ollama models:",
            error
        )

        return []


# ============================================================
# OLLAMA HEALTH CHECK
# ============================================================

def ollama_available():

    if not OLLAMA_HOST:

        print(
            "OLLAMA HEALTH CHECK: "
            "OLLAMA_HOST is not configured."
        )

        return False

    if not PROXY_KEY:

        print(
            "OLLAMA HEALTH CHECK: "
            "MOONPLUG_PROXY_KEY is not configured."
        )

        return False

    try:

        response = proxy_request(
            "GET",
            "/api/tags",
            timeout=30
        )

        if response.status_code == 200:

            print(
                "OLLAMA HEALTH CHECK: OK"
            )

            return True

        print(
            "OLLAMA HEALTH CHECK FAILED:",
            response.status_code,
            response.text[:500]
        )

        return False

    except Exception as error:

        print(
            "OLLAMA CONNECTION TEST FAILED:",
            repr(error)
        )

        return False


# ============================================================
# OWNER PASSWORD
# ============================================================

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

        print(
            "Database ready."
        )

        return True

    except Exception as error:

        print(
            "Database initialization failed:",
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

    if not isinstance(
        data,
        dict
    ):

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400

    password = data.get(
        "password",
        ""
    )

    if not isinstance(
        password,
        str
    ):

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
# HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    ollama_status = False

    if OLLAMA_HOST and PROXY_KEY:

        ollama_status = ollama_available()

    return jsonify({

        "success": True,

        "app": APP_NAME,

        "version": APP_VERSION,

        "status": "online",

        "database":
            "configured"
            if database_available()
            else "not_configured",

        "ollamaConfigured":
            bool(OLLAMA_HOST),

        "proxyKeyConfigured":
            bool(PROXY_KEY),

        "ollamaHostConfigured":
            bool(OLLAMA_HOST),

        "ollamaAvailable":
            ollama_status,

        "ollamaModel":
            OLLAMA_MODEL,

        "time":
            datetime.now().isoformat()
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
                bool(OLLAMA_HOST),

            "proxyKeyConfigured":
                bool(PROXY_KEY),

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

    return jsonify({
        "success": True,
        "users": []
    })


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

    if not isinstance(
        data,
        dict
    ):

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

    if not isinstance(
        question,
        str
    ):

        return jsonify({
            "success": False,
            "error":
                "Question must be text."
        }), 400

    if not isinstance(
        answer,
        str
    ):

        return jsonify({
            "success": False,
            "error":
                "Answer must be text."
        }), 400

    if not isinstance(
        category,
        str
    ):

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
# AUTO TRAINER
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

    if not OLLAMA_HOST:

        return jsonify({
            "success": False,
            "error":
                "OLLAMA_HOST is not configured."
        }), 503

    if not PROXY_KEY:

        return jsonify({
            "success": False,
            "error":
                "MOONPLUG_PROXY_KEY is not configured."
        }), 503

    data = request.get_json(
        silent=True
    )

    if not isinstance(
        data,
        dict
    ):

        return jsonify({
            "success": False,
            "error":
                "Invalid JSON request."
        }), 400

    category = data.get(
        "category"
    )

    if not isinstance(
        category,
        str
    ):

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
    # TEST PROXY /api/tags
    # --------------------------------------------------------

    try:

        models = get_ollama_models()

        print(
            "Ollama models returned:",
            models
        )

    except Exception as error:

        print(
            "OLLAMA /api/tags ERROR:",
            repr(error)
        )

        return jsonify({
            "success": False,
            "error":
                "Could not authenticate with the "
                "Ollama proxy. Check "
                "MOONPLUG_PROXY_KEY."
        }), 503

    # --------------------------------------------------------
    # CHECK MODEL
    # --------------------------------------------------------

    model_exists = any(
        model == OLLAMA_MODEL
        or model.startswith(
            OLLAMA_MODEL + ":"
        )
        for model in models
    )

    if not model_exists:

        return jsonify({

            "success": False,

            "error":
                f"The model '{OLLAMA_MODEL}' "
                f"was not found on the Ollama server. "
                f"Available models: {', '.join(models)}"

        }), 503

    # --------------------------------------------------------
    # PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are the MoonPlug AI training generator.

Generate exactly {amount} useful question-and-answer
training examples about:

{category}

Rules:

1. Every question must be different.
2. Every answer must be different.
3. Cover different parts of the category.
4. Give accurate and useful information.
5. Do not repeat the same information.
6. Do not use markdown.
7. Return ONLY valid JSON.

Required JSON format:

{{
    "training": [
        {{
            "question": "Question here",
            "answer": "Answer here"
        }}
    ]
}}
"""

    # --------------------------------------------------------
    # GENERATE USING AUTHENTICATED OLLAMA CLIENT
    # --------------------------------------------------------

    try:

        client = get_ollama_client()

        print(
            "Sending Auto Trainer request to Ollama:",
            OLLAMA_HOST,
            OLLAMA_MODEL
        )

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
            .strip()
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
            "AUTO TRAINER ERROR:",
            repr(error)
        )

        return jsonify({

            "success": False,

            "error":
                "TinyLlama could not generate "
                "valid training data. "
                "Check the Ollama proxy key "
                "and model connection."

        }), 500

    # --------------------------------------------------------
    # SAVE TRAINING
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

            "requested":
                amount,

            "generated":
                len(training_items),

            "saved":
                len(saved),

            "training":
                saved,

            "message":
                f"Generated and saved "
                f"{len(saved)} training examples "
                f"for '{category}'."

        }), 201

    except Exception as error:

        print(
            "TRAINING DATABASE ERROR:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Training was generated but "
                "could not be saved."

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

    if not isinstance(
        data,
        dict
    ):

        return jsonify({

            "success": False,

            "error":
                "Invalid request."

        }), 400

    message = data.get(
        "message",
        ""
    )

    if not isinstance(
        message,
        str
    ):

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

    # --------------------------------------------------------
    # TRAINED KNOWLEDGE FIRST
    # --------------------------------------------------------

    match = find_best_training_match(
        message
    )

    if match:

        response = match["answer"]

        save_conversation(
            message,
            response
        )

        return jsonify({

            "success": True,

            "response":
                response,

            "source":
                "trained_knowledge",

            "trainingId":
                match["id"],

            "matchScore":
                match.get(
                    "score",
                    0
                )
        })

    # --------------------------------------------------------
    # OLLAMA
    # --------------------------------------------------------

    if OLLAMA_HOST:

        if not PROXY_KEY:

            return jsonify({

                "success": False,

                "error":
                    "MoonPlug proxy key is not configured."

            }), 503

        try:

            client = get_ollama_client()

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
                        "Give clear, useful, "
                        "and friendly answers."
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

                    content = content.strip()

                    if not content:

                        continue

                    messages.append({

                        "role":
                            role,

                        "content":
                            content[:10000]
                    })

            if (
                not messages
                or
                messages[-1].get("role")
                != "user"
                or
                messages[-1].get("content")
                != message
            ):

                messages.append({

                    "role":
                        "user",

                    "content":
                        message
                })

            print(
                "Sending chat request to Ollama:",
                OLLAMA_HOST,
                OLLAMA_MODEL
            )

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

                    "response":
                        response,

                    "source":
                        "ollama",

                    "trainingId":
                        None,

                    "matchScore":
                        0
                })

        except Exception as error:

            print(
                "OLLAMA CHAT ERROR:",
                repr(error)
            )

            return jsonify({

                "success": False,

                "error":
                    "Could not connect to the "
                    "Ollama server. Check the "
                    "proxy URL and MOONPLUG_PROXY_KEY."

            }), 503

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

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

        "response":
            response,

        "source":
            "fallback",

        "trainingId":
            None,

        "matchScore":
            0
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

        "minimum_score":
            0.30,

        "remember_conversations":
            True,

        "case_sensitive":
            False
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

        "settings":
            settings
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

    if not isinstance(
        data,
        dict
    ):

        return jsonify({

            "success": False,

            "error":
                "Invalid request."

        }), 400

    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

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
# OWNER OLLAMA STATUS
# ============================================================

@app.route(
    "/api/owner/ollama/status",
    methods=["GET"]
)
@owner_required
def ollama_status():

    configured = bool(
        OLLAMA_HOST
    )

    key_configured = bool(
        PROXY_KEY
    )

    available = False

    models = []

    error_message = None

    if configured and key_configured:

        try:

            models = get_ollama_models()

            available = True

        except Exception as error:

            error_message = str(
                error
            )

    return jsonify({

        "success": True,

        "configured":
            configured,

        "available":
            available,

        "hostConfigured":
            bool(OLLAMA_HOST),

        "proxyKeyConfigured":
            key_configured,

        "model":
            OLLAMA_MODEL,

        "models":
            models,

        "error":
            error_message
    })


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

        "ownerAuthenticated":
            True,

        "server":
            APP_NAME,

        "version":
            APP_VERSION,

        "status":
            "online",

        "database":
            database_available(),

        "ollamaConfigured":
            bool(OLLAMA_HOST),

        "proxyKeyConfigured":
            bool(PROXY_KEY),

        "ollamaHostConfigured":
            bool(OLLAMA_HOST),

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

        "app":
            APP_NAME,

        "version":
            APP_VERSION,

        "status":
            "online"
    })


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "success": False,

        "error":
            "API endpoint not found."

    }), 404


@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({

        "success": False,

        "error":
            "HTTP method not allowed."

    }), 405


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
    print("                    MOONPLUG AI")
    print("                  RENDER BACKEND")
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
            OWNER_PASSWORD
            or
            OWNER_PASSWORD_HASH
        )
    )

    print(
        "Ollama host configured:",
        bool(OLLAMA_HOST)
    )

    print(
        "Proxy key configured:",
        bool(PROXY_KEY)
    )

    print(
        "Ollama model:",
        OLLAMA_MODEL
    )

    if OLLAMA_HOST:

        print(
            "Ollama host:",
            OLLAMA_HOST
        )

    else:

        print(
            "Ollama host: NOT CONFIGURED"
        )

    print()

    initialize_database()

    print()

    if OLLAMA_HOST and PROXY_KEY:

        ollama_available()

    else:

        print(
            "Ollama health check skipped: "
            "host or proxy key missing."
        )

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


