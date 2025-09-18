import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const res = await db.execute(
      "SELECT * FROM phone_history ORDER BY created_at DESC LIMIT 50"
    );
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error("History route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}







