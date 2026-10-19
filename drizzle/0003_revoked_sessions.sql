CREATE TABLE revoked_sessions (token_hash TEXT PRIMARY KEY NOT NULL, expires_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE account_session_cutoffs (user_id TEXT PRIMARY KEY NOT NULL, revoked_before INTEGER NOT NULL);
