
"""
=============================================================
                    MOONPLUG AI
                 SECURE PYTHON BACKEND
=============================================================

Purpose:
    Backend server for the MoonPlug AI website.

Features:
    • Secure owner authentication
    • Password hashing
    • Server-side sessions
    • Protected owner routes
    • Login rate limiting
    • Training API
    • Statistics API
    • Health check
    • CORS support
    • JSON responses
    • Environment-variable secrets
    • No owner password stored in JavaScript

IMPORTANT:
    Never put the OWNER_PASSWORD or SECRET_KEY directly
    into your GitHub repository.

Environment variables:

    MOONPLUG_OWNER_PASSWORD
    MOONPLUG_SECRET_KEY

Example PowerShell setup:

    $env:MOONPLUG_OWNER_PASSWORD="your-password"
    $env:MOONPLUG_SECRET_KEY="long-random-secret"

Then run:

    python server.py

Server:

    http://127.0.0.1:5000
=============================================================
"""

from __future__ import annotations

import os
import json
import secrets
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import (
    Flask,
    jsonify,
    request,
    session,
)

from flask_cors import CORS

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

APP_NAME = "MoonPlug AI"

APP_VERSION = "2.0.0"

BASE_DIR = Path(__file__).resolve().parent

MEMORY_FILE = BASE_DIR / "moonplug_memory.json"


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)


# ============================================================
# SECURITY CONFIGURATION
# ============================================================

# Never hard-code your real secret key in GitHub.
SECRET_KEY = os.environ.get(
    "MOONPLUG_SECRET_KEY"
)


if not SECRET_KEY:

    # This is acceptable for local testing.
    # A permanent secret should be supplied through
    # MOONPLUG_SECRET_KEY before production deployment.

    SECRET_KEY = secrets.token_hex(32)

    print()
    print(
        "WARNING:"
    )

    print(
        "MOONPLUG_SECRET_KEY was not set."
    )

    print(
        "A temporary secret was generated for this run."
    )

    print(
        "Users will be logged out when the server restarts."
    )

    print()


app.config["SECRET_KEY"] = SECRET_KEY


# Session security.

app.config["SESSION_COOKIE_HTTPONLY"] = True

app.config["SESSION_COOKIE_SAMESITE"] = "None"

app.config["SESSION_COOKIE_SECURE"] = True

# Session lifetime.

app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(
    hours=2
)


# ============================================================
# CORS
# ============================================================

"""
For development, this allows your GitHub Pages frontend
to communicate with the local Flask server.

Later, when the backend is deployed, replace this with
your exact MoonPlug website domain.
"""

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://xavier1azurus.github.io",
    ],
)


# ============================================================
# OWNER AUTHENTICATION
# ============================================================

OWNER_PASSWORD = os.environ.get(
    "MOONPLUG_OWNER_PASSWORD"
)


if not OWNER_PASSWORD:

    print()
    print(
        "WARNING:"
    )

    print(
        "MOONPLUG_OWNER_PASSWORD is not configured."
    )

    print(
        "Owner login will NOT work until you configure it."
    )

    print()


# ============================================================
# PASSWORD HASH
# ============================================================

"""
The password is converted into a secure hash.

The original owner password is never stored in the memory
file and is never sent to the browser.
"""

OWNER_PASSWORD_HASH = None


if OWNER_PASSWORD:

    OWNER_PASSWORD_HASH = generate_password_hash(
        OWNER_PASSWORD
    )


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


def clean_old_login_attempts():

    now = datetime.now().timestamp()

    expired = []

    for ip, attempts in login_attempts.items():

        attempts[:] = [

            timestamp

            for timestamp in attempts

            if now - timestamp < LOGIN_WINDOW_SECONDS

        ]

        if not attempts:

            expired.append(ip)

    for ip in expired:

        del login_attempts[ip]


def is_rate_limited():

    clean_old_login_attempts()

    ip = get_client_ip()

    attempts = login_attempts.get(
        ip,
        []
    )

    return len(attempts) >= MAX_LOGIN_ATTEMPTS


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
# MEMORY
# ============================================================

def create_empty_memory():

    now = datetime.now().isoformat()

    return {

        "version": APP_VERSION,

        "created": now,

        "updated": now,

        "settings": {

            "minimum_score": 0.30,

            "remember_conversations": True,

            "case_sensitive": False,

        },

        "training": [],

        "conversations": [],

        "users": [],

    }


def load_memory():

    if not MEMORY_FILE.exists():

        memory = create_empty_memory()

        save_memory(memory)

        return memory

    try:

        with open(
            MEMORY_FILE,
            "r",
            encoding="utf-8",
        ) as file:

            memory = json.load(file)

    except (
        OSError,
        json.JSONDecodeError,
    ):

        memory = create_empty_memory()

    if not isinstance(memory, dict):

        memory = create_empty_memory()

    memory.setdefault(
        "training",
        []
    )

    memory.setdefault(
        "conversations",
        []
    )

    memory.setdefault(
        "users",
        []
    )

    memory.setdefault(
        "settings",
        {}
    )

    memory["settings"].setdefault(
        "minimum_score",
        0.30
    )

    memory["settings"].setdefault(
        "remember_conversations",
        True
    )

    memory["settings"].setdefault(
        "case_sensitive",
        False
    )

    return memory


def save_memory(memory):

    memory["updated"] = datetime.now().isoformat()

    temporary_file = MEMORY_FILE.with_suffix(
        ".tmp"
    )

    try:

        with open(
            temporary_file,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                memory,
                file,
                indent=4,
                ensure_ascii=False,
            )

        temporary_file.replace(
            MEMORY_FILE
        )

        return True

    except OSError as error:

        print(
            f"Could not save memory: {error}"
        )

        return False


# ============================================================
# AUTHENTICATION DECORATOR
# ============================================================

def owner_required(function):
    """
    Protect an API route so only authenticated owners
    can access it.
    """

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

        return function(
            *args,
            **kwargs
        )

    return wrapper


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "success": True,

        "app": APP_NAME,

        "version": APP_VERSION,

        "status": "online",

        "time": datetime.now().isoformat(),

    })


# ============================================================
# OWNER LOGIN
# ============================================================

@app.route(
    "/api/owner/login",
    methods=["POST"]
)
def owner_login():

    if is_rate_limited():

        return jsonify({

            "success": False,

            "error": (
                "Too many login attempts. "
                "Please wait a few minutes."
            ),

        }), 429

    if OWNER_PASSWORD_HASH is None:

        return jsonify({

            "success": False,

            "error": (
                "Owner authentication is not configured "
                "on the server."
            ),

        }), 503

    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):

        return jsonify({

            "success": False,

            "error": "Invalid request."

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

            "error": "Invalid password."

        }), 401

    if len(password) > 256:

        record_failed_login()

        return jsonify({

            "success": False,

            "error": "Invalid password."

        }), 401

    if not check_password_hash(
        OWNER_PASSWORD_HASH,
        password
    ):

        record_failed_login()

        return jsonify({

            "success": False,

            "error": "Incorrect owner code."

        }), 401

    # Clear failed attempts after successful login.

    ip = get_client_ip()

    login_attempts.pop(
        ip,
        None
    )

    # Create a fresh session.

    session.clear()

    session.permanent = True

    session["owner_authenticated"] = True

    session["login_time"] = datetime.now().isoformat()

    session["session_id"] = secrets.token_hex(
        16
    )

    return jsonify({

        "success": True,

        "authenticated": True,

        "message": "Owner login successful."

    })


# ============================================================
# OWNER SESSION CHECK
# ============================================================

@app.route(
    "/api/owner/session",
    methods=["GET"]
)
def owner_session():

    authenticated = session.get(
        "owner_authenticated",
        False
    )

    return jsonify({

        "success": True,

        "authenticated": bool(
            authenticated
        ),

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

        "authenticated": False,

        "message": "Logged out."

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

    memory = load_memory()

    training = memory.get(
        "training",
        []
    )

    conversations = memory.get(
        "conversations",
        []
    )

    users = memory.get(
        "users",
        []
    )

    total_uses = 0

    for example in training:

        try:

            total_uses += int(
                example.get(
                    "uses",
                    0
                )
            )

        except (
            ValueError,
            TypeError,
        ):

            pass

    categories = {}

    for example in training:

        category = example.get(
            "category",
            "general"
        )

        categories[category] = (
            categories.get(
                category,
                0
            )
            + 1
        )

    return jsonify({

        "success": True,

        "stats": {

            "users": len(users),

            "chats": len(conversations),

            "training": len(training),

            "responseUses": total_uses,

            "categories": categories,

        },

        "server": {

            "status": "online",

            "version": APP_VERSION,

        },

    })


# ============================================================
# GET TRAINING DATA
# ============================================================

@app.route(
    "/api/owner/training",
    methods=["GET"]
)
@owner_required
def get_training():

    memory = load_memory()

    return jsonify({

        "success": True,

        "training": memory.get(
            "training",
            []
        ),

    })


# ============================================================
# ADD TRAINING DATA
# ============================================================

@app.route(
    "/api/owner/training",
    methods=["POST"]
)
@owner_required
def add_training():

    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):

        return jsonify({

            "success": False,

            "error": "Invalid request."

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

            "error": "Question must be text."

        }), 400

    if not isinstance(
        answer,
        str
    ):

        return jsonify({

            "success": False,

            "error": "Answer must be text."

        }), 400

    if not isinstance(
        category,
        str
    ):

        category = "general"

    question = question.strip()

    answer = answer.strip()

    category = category.strip()

    if not question:

        return jsonify({

            "success": False,

            "error": "Question cannot be empty."

        }), 400

    if not answer:

        return jsonify({

            "success": False,

            "error": "Answer cannot be empty."

        }), 400

    if len(question) > 2000:

        return jsonify({

            "success": False,

            "error": "Question is too long."

        }), 400

    if len(answer) > 10000:

        return jsonify({

            "success": False,

            "error": "Answer is too long."

        }), 400

    memory = load_memory()

    ids = []

    for item in memory.get(
        "training",
        []
    ):

        try:

            ids.append(
                int(
                    item.get(
                        "id",
                        0
                    )
                )
            )

        except (
            ValueError,
            TypeError,
        ):

            pass

    next_id = (
        max(ids) + 1
        if ids
        else 1
    )

    example = {

        "id": next_id,

        "question": question,

        "answer": answer,

        "category": category or "general",

        "created": datetime.now().isoformat(),

        "uses": 0,

    }

    memory.setdefault(
        "training",
        []
    ).append(
        example
    )

    save_memory(
        memory
    )

    return jsonify({

        "success": True,

        "training": example,

    }), 201


# ============================================================
# DELETE TRAINING DATA
# ============================================================

@app.route(
    "/api/owner/training/<int:training_id>",
    methods=["DELETE"]
)
@owner_required
def delete_training(
    training_id
):

    memory = load_memory()

    training = memory.get(
        "training",
        []
    )

    for index, example in enumerate(
        training
    ):

        try:

            example_id = int(
                example.get(
                    "id",
                    0
                )
            )

        except (
            ValueError,
            TypeError,
        ):

            continue

        if example_id == training_id:

            del training[index]

            save_memory(
                memory
            )

            return jsonify({

                "success": True,

                "message": "Training example deleted."

            })

    return jsonify({

        "success": False,

        "error": "Training example not found."

    }), 404


# ============================================================
# OWNER USERS
# ============================================================

@app.route(
    "/api/owner/users",
    methods=["GET"]
)
@owner_required
def get_users():

    memory = load_memory()

    users = memory.get(
        "users",
        []
    )

    # Do not expose passwords or password hashes.

    safe_users = []

    for user in users:

        if not isinstance(
            user,
            dict
        ):

            continue

        safe_users.append({

            "id": user.get(
                "id"
            ),

            "email": user.get(
                "email"
            ),

            "created": user.get(
                "created"
            ),

        })

    return jsonify({

        "success": True,

        "users": safe_users,

    })


# ============================================================
# OWNER APP SETTINGS
# ============================================================

@app.route(
    "/api/owner/settings",
    methods=["GET"]
)
@owner_required
def get_settings():

    memory = load_memory()

    settings = memory.get(
        "settings",
        {}
    )

    return jsonify({

        "success": True,

        "settings": {

            "minimum_score": settings.get(
                "minimum_score",
                0.30
            ),

            "remember_conversations": settings.get(
                "remember_conversations",
                True
            ),

            "case_sensitive": settings.get(
                "case_sensitive",
                False
            ),

        },

    })


# ============================================================
# UPDATE APP SETTINGS
# ============================================================

@app.route(
    "/api/owner/settings",
    methods=["POST"]
)
@owner_required
def update_settings():

    data = request.get_json(
        silent=True
    )

    if not isinstance(
        data,
        dict
    ):

        return jsonify({

            "success": False,

            "error": "Invalid request."

        }), 400

    memory = load_memory()

    settings = memory.setdefault(
        "settings",
        {}
    )

    if "minimum_score" in data:

        try:

            score = float(
                data["minimum_score"]
            )

        except (
            ValueError,
            TypeError,
        ):

            return jsonify({

                "success": False,

                "error": "Invalid minimum score."

            }), 400

        if not 0 <= score <= 1:

            return jsonify({

                "success": False,

                "error": "Minimum score must be between 0 and 1."

            }), 400

        settings["minimum_score"] = score

    if "remember_conversations" in data:

        if not isinstance(
            data["remember_conversations"],
            bool
        ):

            return jsonify({

                "success": False,

                "error": "remember_conversations must be true or false."

            }), 400

        settings[
            "remember_conversations"
        ] = data[
            "remember_conversations"
        ]

    if "case_sensitive" in data:

        if not isinstance(
            data["case_sensitive"],
            bool
        ):

            return jsonify({

                "success": False,

                "error": "case_sensitive must be true or false."

            }), 400

        settings[
            "case_sensitive"
        ] = data[
            "case_sensitive"
        ]

    save_memory(
        memory
    )

    return jsonify({

        "success": True,

        "settings": settings,

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

        "ownerAuthenticated": True,

        "server": "MoonPlug AI",

        "version": APP_VERSION,

        "status": "online",

    })


# ============================================================
# 404 HANDLER
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "success": False,

        "error": "API endpoint not found."

    }), 404


# ============================================================
# 405 HANDLER
# ============================================================

@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({

        "success": False,

        "error": "HTTP method not allowed."

    }), 405


# ============================================================
# 500 HANDLER
# ============================================================

@app.errorhandler(500)
def server_error(error):

    return jsonify({

        "success": False,

        "error": "Internal server error."

    }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print(
        "============================================================="
    )

    print(
        "                    MOONPLUG AI"
    )

    print(
        "                 SECURE BACKEND SERVER"
    )

    print(
        "============================================================="
    )

    print()

    print(
        f"Version: {APP_VERSION}"
    )

    print(
        f"Memory:  {MEMORY_FILE}"
    )

    print()

    if OWNER_PASSWORD:

        print(
            "Owner authentication: CONFIGURED"
        )

    else:

        print(
            "Owner authentication: NOT CONFIGURED"
        )

    print()

    print(
        "Local server:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print()

    print(
        "Health check:"
    )

    print(
        "http://127.0.0.1:5000/api/health"
    )

    print()

    print(
        "Press CTRL+C to stop the server."
    )

    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )
