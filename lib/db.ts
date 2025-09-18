// lib/db.ts
import { createClient } from "@libsql/client";

if (!process.env.LIBSQL_URL || !process.env.LIBSQL_TOKEN) {
  throw new Error("LIBSQL_URL or LIBSQL_TOKEN is not set");
}

export const db = createClient({
  url: process.env.LIBSQL_URL,
  authToken: process.env.LIBSQL_TOKEN,
});


