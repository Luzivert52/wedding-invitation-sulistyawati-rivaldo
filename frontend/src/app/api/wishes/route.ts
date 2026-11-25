import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase server environment is not configured.");
    return NextResponse.json(
      { message: "Buku tamu belum tersedia." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { data, error } = await supabase
    .from("rsvps")
    .select("id, name, message, created_at")
    .eq("publish", true)
    .neq("message", "")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Unable to load public wishes:", error.message);
    return NextResponse.json(
      { message: "Buku tamu belum tersedia." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { wishes: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
