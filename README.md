# 📱 Number Validator

A Next.js app for validating phone numbers using the [NumVerify API](https://numverify.com/) and storing lookup history in a [Turso (libSQL)](https://turso.tech/) database.  
Fully responsive with Tailwind CSS.

---

## 🚀 Features
- Validate phone numbers (NumVerify API)
- Store results in Turso/libSQL
- Retrieve recent lookup history
- Mobile-friendly UI

---

## 📦 Stack
- [Next.js 15 (App Router + Turbopack)](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Turso / libSQL](https://turso.tech/)
- [NumVerify API](https://numverify.com/)

---

## Environment Variables

```
NEXT_PUBLIC_NUMVERIFY_KEY=your_numverify_api_key
LIBSQL_URL=libsql://your-database-url.turso.io
LIBSQL_TOKEN=your_turso_auth_token
```

## Database
```
CREATE TABLE lookups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL,
  country TEXT,
  carrier TEXT,
  valid INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```


