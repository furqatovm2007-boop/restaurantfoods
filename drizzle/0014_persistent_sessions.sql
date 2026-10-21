CREATE TABLE persistent_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  session_key TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX persistent_sessions_chain ON persistent_sessions (session_key);
CREATE INDEX persistent_sessions_expiry ON persistent_sessions (expires_at);
