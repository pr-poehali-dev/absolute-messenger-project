"""
Аутентификация пользователей: регистрация, вход, выход, получение профиля.
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p81045839_absolute_messenger_p")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers") or {}
    session_token = headers.get("x-session-token") or headers.get("X-Session-Token")

    def ok(data):
        return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data)}

    def err(msg, code=400):
        return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET" and not session_token:
            return err("Не авторизован", 401)

        if method == "POST" and path.endswith("/register"):
            username = (body.get("username") or "").strip().lower()
            name = (body.get("name") or "").strip()
            password = body.get("password") or ""

            if not username or not name or not password:
                return err("Все поля обязательны")
            if len(password) < 4:
                return err("Пароль минимум 4 символа")

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
            if cur.fetchone():
                return err("Никнейм уже занят")

            token = secrets.token_hex(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, name, password_hash, session_token, status) VALUES (%s, %s, %s, %s, 'online') RETURNING id, username, name, bio, status",
                (username, name, hash_password(password), token)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({"token": token, "user": {"id": row[0], "username": row[1], "name": row[2], "bio": row[3], "status": row[4]}})

        elif method == "POST" and path.endswith("/login"):
            username = (body.get("username") or "").strip().lower()
            password = body.get("password") or ""

            cur.execute(
                f"SELECT id, username, name, bio, status FROM {SCHEMA}.users WHERE username = %s AND password_hash = %s",
                (username, hash_password(password))
            )
            row = cur.fetchone()
            if not row:
                return err("Неверный никнейм или пароль", 401)

            token = secrets.token_hex(32)
            cur.execute(f"UPDATE {SCHEMA}.users SET session_token = %s, status = 'online', last_seen_at = NOW() WHERE id = %s", (token, row[0]))
            conn.commit()
            return ok({"token": token, "user": {"id": row[0], "username": row[1], "name": row[2], "bio": row[3], "status": row[4]}})

        elif method == "POST" and path.endswith("/logout"):
            if not session_token:
                return err("Нет токена", 401)
            cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL, status = 'offline', last_seen_at = NOW() WHERE session_token = %s", (session_token,))
            conn.commit()
            return ok({"ok": True})

        elif method == "GET" and path.endswith("/me"):
            if not session_token:
                return err("Не авторизован", 401)
            cur.execute(f"SELECT id, username, name, bio, status FROM {SCHEMA}.users WHERE session_token = %s", (session_token,))
            row = cur.fetchone()
            if not row:
                return err("Токен недействителен", 401)
            return ok({"user": {"id": row[0], "username": row[1], "name": row[2], "bio": row[3], "status": row[4]}})

        elif method == "PUT" and path.endswith("/me"):
            if not session_token:
                return err("Не авторизован", 401)
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE session_token = %s", (session_token,))
            row = cur.fetchone()
            if not row:
                return err("Токен недействителен", 401)
            user_id = row[0]
            name = body.get("name")
            username = body.get("username")
            bio = body.get("bio")
            if name:
                cur.execute(f"UPDATE {SCHEMA}.users SET name = %s WHERE id = %s", (name.strip(), user_id))
            if username:
                username = username.strip().lower()
                cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s AND id != %s", (username, user_id))
                if cur.fetchone():
                    return err("Никнейм уже занят")
                cur.execute(f"UPDATE {SCHEMA}.users SET username = %s WHERE id = %s", (username, user_id))
            if bio is not None:
                cur.execute(f"UPDATE {SCHEMA}.users SET bio = %s WHERE id = %s", (bio, user_id))
            conn.commit()
            cur.execute(f"SELECT id, username, name, bio, status FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            return ok({"user": {"id": row[0], "username": row[1], "name": row[2], "bio": row[3], "status": row[4]}})

        elif method == "GET" and path.endswith("/users"):
            if not session_token:
                return err("Не авторизован", 401)
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE session_token = %s", (session_token,))
            me = cur.fetchone()
            if not me:
                return err("Токен недействителен", 401)
            cur.execute(
                f"SELECT id, username, name, status, last_seen_at FROM {SCHEMA}.users WHERE id != %s ORDER BY name",
                (me[0],)
            )
            rows = cur.fetchall()
            users = []
            for r in rows:
                last_seen = r[4].strftime("%d.%m %H:%M") if r[4] else None
                users.append({"id": r[0], "username": r[1], "name": r[2], "status": r[3], "lastSeen": last_seen})
            return ok({"users": users})

        return err("Не найдено", 404)
    finally:
        cur.close()
        conn.close()