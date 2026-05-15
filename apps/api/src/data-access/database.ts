import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { env } from '@workspace/env/server'

mkdirSync(dirname(env.DATABASE_PATH), { recursive: true })

export const database = new Database(env.DATABASE_PATH)

database.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    severity TEXT NOT NULL,
    state TEXT NOT NULL,
    evidence_url TEXT,
    due_at TEXT NOT NULL,
    hold_until TEXT,
    holder TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS handoffs (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
  );

  CREATE TABLE IF NOT EXISTS repo_checks (
    id TEXT PRIMARY KEY,
    repo TEXT NOT NULL,
    status TEXT NOT NULL,
    summary TEXT NOT NULL,
    pushed_at TEXT,
    url TEXT NOT NULL,
    checked_at TEXT NOT NULL
  );
`)
