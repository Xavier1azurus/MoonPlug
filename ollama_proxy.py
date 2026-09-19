# MoonPlug Ollama Proxy

import os
import requests

from flask import Flask, request, jsonify, Response, stream_with_context


app = Flask(__name__)

OLLAMA_URL = "http://127.0.0.1:11434"

PROXY_KEY = os.environ.get(
    "PROXY_KEY",
    ""
).strip()


def authorized():

    supplied_key = request.headers.get(
        "X-Proxy-Key",
        ""
    ).strip()

    print(
        "PROXY AUTH DEBUG:",
        "received=",
        bool(supplied_key),
        "length=",
        len(supplied_key)
    )

    return (
        bool(PROXY_KEY)
        and supplied_key == PROXY_KEY
    )


@app.route("/health", methods=["GET"])
def health():

    if not authorized():

        return jsonify({
            "success": False,
            "error": "Forbidden"
        }), 403

    try:

        response = requests.get(
            f"{OLLAMA_URL}/api/tags",
            timeout=10
        )

        if response.ok:

            return jsonify({
                "success": True,
                "ollama": "online"
            })

        return jsonify({
            "success": False,
            "ollama": "offline"
        }), 503

    except requests.RequestException:

        return jsonify({
            "success": False,
            "ollama": "offline"
        }), 503


@app.route("/api/tags", methods=["GET"])
def tags():

    if not authorized():

        return jsonify({
            "success": False,
            "error": "Forbidden"
        }), 403

    try:

        response = requests.get(
            f"{OLLAMA_URL}/api/tags",
            timeout=30
        )

        return (
            response.content,
            response.status_code,
            {
                "Content-Type":
                    response.headers.get(
                        "Content-Type",
                        "application/json"
                    )
            }
        )

    except requests.RequestException as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 503


# ============================================================
# STREAMING CHAT
# ============================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    if not authorized():

        return jsonify({
            "success": False,
            "error": "Forbidden"
        }), 403

    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):

        return jsonify({
            "success": False,
            "error": "Invalid JSON request."
        }), 400

    # Make absolutely sure Ollama streams
    data["stream"] = True

    try:

        upstream = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json=data,
            headers={
                "Accept": "application/x-ndjson"
            },
            timeout=300,
            stream=True
        )

        if not upstream.ok:

            error_text = upstream.text[:1000]

            upstream.close()

            return jsonify({
                "success": False,
                "error": error_text
            }), upstream.status_code

        @stream_with_context
        def generate():

            try:

               for line in upstream.iter_lines(
    chunk_size=1,
    decode_unicode=True
):
                    if not line:
                        continue

                    # Send each Ollama JSON chunk immediately
                    yield line + "\n"

            finally:

                upstream.close()

        return Response(
            generate(),
            status=upstream.status_code,
            content_type="application/x-ndjson; charset=utf-8",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )

    except requests.RequestException as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 503


if __name__ == "__main__":

    if not PROXY_KEY:

        print(
            "ERROR: PROXY_KEY is not configured."
        )

        raise SystemExit(1)

    print()
    print("=" * 60)
    print("             MOONPLUG OLLAMA PROXY")
    print("=" * 60)
    print()
    print("Ollama:", OLLAMA_URL)
    print("Proxy key: configured")
    print()
    print("Proxy running on:")
    print("http://127.0.0.1:5001")
    print()

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False,
        threaded=True
    )
