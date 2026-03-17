"""
Управление чатами: список чатов пользователя, создание/открытие чата с другим пользователем.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p81045839_absolute_messenger_p")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_by_token(cur, token):
    cur.execute(f"SELECT id, username, name, status FROM {SCHEMA}.users WHERE session_token = %s", (token,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    token = headers.get("x-session-token") or headers.get("X-Session-Token")

    def ok(data):
        return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}

    def err(msg, code=400):
        return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}

    if not token:
        return err("Не авторизован", 401)

    conn = get_conn()
    cur = conn.cursor()

    try:
        me = get_user_by_token(cur, token)
        if not me:
            return err("Токен недействителен", 401)
        my_id = me[0]

        if method == "GET":
            cur.execute(f"""
                SELECT
                    c.id,
                    u.id as partner_id,
                    u.username,
                    u.name,
                    u.status,
                    u.last_seen_at,
                    m.text as last_msg_text,
                    m.created_at as last_msg_time,
                    m.sender_id as last_msg_sender,
                    (SELECT COUNT(*) FROM {SCHEMA}.messages msg2
                     WHERE msg2.chat_id = c.id AND msg2.sender_id != %s AND msg2.status != 'read') as unread_count
                FROM {SCHEMA}.chats c
                JOIN {SCHEMA}.users u ON (
                    CASE WHEN c.user_a_id = %s THEN c.user_b_id ELSE c.user_a_id END = u.id
                )
                LEFT JOIN LATERAL (
                    SELECT text, created_at, sender_id FROM {SCHEMA}.messages
                    WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
                ) m ON true
                WHERE c.user_a_id = %s OR c.user_b_id = %s
                ORDER BY COALESCE(m.created_at, c.created_at) DESC
            """, (my_id, my_id, my_id, my_id))
            rows = cur.fetchall()
            chats = []
            for r in rows:
                last_seen = r[5].strftime("%d.%m %H:%M") if r[5] else None
                last_msg_time = r[7].strftime("%H:%M") if r[7] else None
                chats.append({
                    "id": str(r[0]),
                    "user": {"id": str(r[1]), "username": r[2], "name": r[3], "status": r[4], "lastSeen": last_seen},
                    "lastMessage": {"text": r[6], "time": last_msg_time, "isOwn": r[8] == my_id} if r[6] else None,
                    "unread": int(r[9])
                })
            return ok({"chats": chats})

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            partner_id = body.get("partnerId")
            if not partner_id:
                return err("partnerId обязателен")
            partner_id = int(partner_id)
            if partner_id == my_id:
                return err("Нельзя создать чат с собой")

            a, b = min(my_id, partner_id), max(my_id, partner_id)
            cur.execute(f"SELECT id FROM {SCHEMA}.chats WHERE user_a_id = %s AND user_b_id = %s", (a, b))
            row = cur.fetchone()
            if row:
                chat_id = row[0]
            else:
                cur.execute(f"INSERT INTO {SCHEMA}.chats (user_a_id, user_b_id) VALUES (%s, %s) RETURNING id", (a, b))
                chat_id = cur.fetchone()[0]
                conn.commit()

            cur.execute(f"SELECT id, username, name, status, last_seen_at FROM {SCHEMA}.users WHERE id = %s", (partner_id,))
            p = cur.fetchone()
            last_seen = p[4].strftime("%d.%m %H:%M") if p[4] else None
            return ok({"chatId": str(chat_id), "user": {"id": str(p[0]), "username": p[1], "name": p[2], "status": p[3], "lastSeen": last_seen}})

        return err("Не найдено", 404)
    finally:
        cur.close()
        conn.close()
