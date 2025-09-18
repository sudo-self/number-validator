import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { number } = await req.json();
    if (!number) return NextResponse.json({ error: "Number required" }, { status: 400 });

    // Check cache
    const cached = await db
      .execute("SELECT * FROM phone_history WHERE number = ?", [number])
      .then(res => res.rows[0] || null);

    if (cached) return NextResponse.json({ ...cached, cached: true });

    // Fetch from Numverify
    const response = await fetch(
      `https://apilayer.net/api/validate?access_key=${process.env.NEXT_PUBLIC_NUMVERIFY_KEY}&number=${number}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Numverify error:", text);
      return NextResponse.json({ error: "Numverify API error" }, { status: 500 });
    }

    const result = await response.json();

    // Save to DB
    await db.execute(
      `INSERT INTO phone_history 
       (number, valid, local_format, international_format, country_prefix, country_code, country_name, location, carrier, line_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.number,
        result.valid,
        result.local_format,
        result.international_format,
        result.country_prefix,
        result.country_code,
        result.country_name,
        result.location,
        result.carrier,
        result.line_type,
        new Date().toISOString(),
      ]
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Validate route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}




