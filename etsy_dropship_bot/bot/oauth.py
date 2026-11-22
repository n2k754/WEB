"""Autorisation Etsy (OAuth 2.0 + PKCE) et renouvellement des jetons.

Usage unique (ouvre ton navigateur, tu cliques sur « Autoriser ») :
    export ETSY_API_KEY=<keystring de ton app>
    python -m bot.oauth

URL de rappel attendue (à déclarer à l'identique dans ton app Etsy) :
    http://localhost:3003/callback

Points NON vérifiés contre un vrai compte Etsy : URLs, portées et format des
réponses sont écrits d'après la documentation publique d'Etsy (developers.etsy.com).
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import secrets
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

AUTH_URL = "https://www.etsy.com/oauth/connect"
TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token"
REDIRECT_URI = "http://localhost:3003/callback"
SCOPES = "transactions_r transactions_w"
TOKEN_FILE = "etsy_tokens.json"


def make_pkce() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b"=").decode()
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


def build_auth_url(client_id: str, state: str, challenge: str,
                   redirect_uri: str = REDIRECT_URI, scopes: str = SCOPES) -> str:
    q = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scopes,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })
    return f"{AUTH_URL}?{q}"


def _post_token(form: dict) -> dict:
    req = urllib.request.Request(
        TOKEN_URL, data=urllib.parse.urlencode(form).encode(), method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def _save(tokens: dict, path: str) -> dict:
    data = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "expires_at": time.time() + int(tokens.get("expires_in", 3600)),
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    os.chmod(path, 0o600)
    return data


class EtsyAuth:
    """Fournit un jeton d'accès valide, renouvelé automatiquement."""

    def __init__(self, client_id: str, path: str = TOKEN_FILE):
        self.client_id, self.path = client_id, path

    def access_token(self) -> str:
        with open(self.path, encoding="utf-8") as f:
            tok = json.load(f)
        if tok["expires_at"] - 60 > time.time():
            return tok["access_token"]
        new = _post_token({
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "refresh_token": tok["refresh_token"],
        })
        return _save(new, self.path)["access_token"]


def authorize(client_id: str, path: str = TOKEN_FILE) -> None:
    verifier, challenge = make_pkce()
    state = secrets.token_urlsafe(16)
    url = build_auth_url(client_id, state, challenge)
    got: dict = {}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            got.update({k: v[0] for k, v in qs.items()})
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("Autorisation reçue. Tu peux fermer cet onglet.".encode())

        def log_message(self, *a):  # silence
            pass

    port = urllib.parse.urlparse(REDIRECT_URI).port
    server = HTTPServer(("127.0.0.1", port), Handler)
    print("Ouvre cette adresse si le navigateur ne s'ouvre pas seul :\n", url)
    webbrowser.open(url)
    while "code" not in got and "error" not in got:
        server.handle_request()
    if got.get("error") or got.get("state") != state:
        raise SystemExit(f"autorisation refusée ou état invalide: {got}")
    tokens = _post_token({
        "grant_type": "authorization_code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "code": got["code"],
        "code_verifier": verifier,
    })
    _save(tokens, path)
    print(f"Jetons enregistrés dans {path} (ne le commite jamais).")


if __name__ == "__main__":
    authorize(os.environ["ETSY_API_KEY"].split(":")[0])
