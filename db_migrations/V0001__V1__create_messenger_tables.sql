
CREATE TABLE IF NOT EXISTS t_p81045839_absolute_messenger_p.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'offline',
  session_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81045839_absolute_messenger_p.chats (
  id SERIAL PRIMARY KEY,
  user_a_id INT NOT NULL REFERENCES t_p81045839_absolute_messenger_p.users(id),
  user_b_id INT NOT NULL REFERENCES t_p81045839_absolute_messenger_p.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id)
);

CREATE TABLE IF NOT EXISTS t_p81045839_absolute_messenger_p.messages (
  id SERIAL PRIMARY KEY,
  chat_id INT NOT NULL REFERENCES t_p81045839_absolute_messenger_p.chats(id),
  sender_id INT NOT NULL REFERENCES t_p81045839_absolute_messenger_p.users(id),
  text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p81045839_absolute_messenger_p.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_a ON t_p81045839_absolute_messenger_p.chats(user_a_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_b ON t_p81045839_absolute_messenger_p.chats(user_b_id);
CREATE INDEX IF NOT EXISTS idx_users_session ON t_p81045839_absolute_messenger_p.users(session_token);
