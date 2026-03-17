"""
Сообщения: получение истории чата, отправка сообщения, отметка как прочитанных.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p81045839_absolute_messenger_p")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    token = headers.get("x-session-token") or headers.get("X-Session-Token")
    params = event.get("queryStringParameters") or {}

    def ok(data):
        return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}

    def err(msg, code=400):
        return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}

    if not token:
        return err("Не авторизован", 401)

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE session_token = %s", (token,))
        me = cur.fetchone()
        if not me:
            return err("Токен недействителен", 401)
        my_id = me[0]

        if method == "GET":
            chat_id = params.get("chatId")
            if not chat_id:
                return err("chatId обязателен")
            chat_id = int(chat_id)

            cur.execute(
                f"SELECT id FROM {SCHEMA}.chats WHERE id = %s AND (user_a_id = %s OR user_b_id = %s)",
                (chat_id, my_id, my_id)
            )
            if not cur.fetchone():
                return err("Чат не найден", 404)

            cur.execute(
                f"UPDATE {SCHEMA}.messages SET status = 'read' WHERE chat_id = %s AND sender_id != %s AND status != 'read'",
                (chat_id, my_id)
            )
            conn.commit()

            cur.execute(f"""
                SELECT m.id, m.text, m.status, m.created_at, m.sender_id
                FROM {SCHEMA}.messages m
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
                LIMIT 100
            """, (chat_id,))
            rows = cur.fetchall()
            messages = []
            for r in rows:
                messages.append({
                    "id": str(r[0]),
                    "text": r[1],
                    "status": r[2],
                    "time": r[3].strftime("%H:%M"),
                    "isOwn": r[4] == my_id
                })
            return ok({"messages": messages})

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            chat_id = body.get("chatId")
            text = (body.get("text") or "").strip()
            if not chat_id or not text:
                return err("chatId и text обязательны")
            chat_id = int(chat_id)

            cur.execute(
                f"SELECT id FROM {SCHEMA}.chats WHERE id = %s AND (user_a_id = %s OR user_b_id = %s)",
                (chat_id, my_id, my_id)
            )
            if not cur.fetchone():
                return err("Чат не найден", 404)

            cur.execute(
                f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text, status) VALUES (%s, %s, %s, 'sent') RETURNING id, created_at",
                (chat_id, my_id, text)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({
                "message": {
                    "id": str(row[0]),
                    "text": text,
                    "status": "sent",
                    "time": row[1].strftime("%H:%M"),
                    "isOwn": True
                }
            })

        return err("Не найдено", 404)
    finally:
        cur.close()
        conn.close()
