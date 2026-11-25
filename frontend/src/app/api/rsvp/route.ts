import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase";
import { validateRSVP, type RSVPSubmission } from "@/lib/server/rsvp-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_PER_MINUTE = 10;

function response(success: boolean, message: string, status = 200, headers?: HeadersInit) {
  return NextResponse.json({ success, message }, { status, headers });
}

async function readBodyWithinLimit(request: Request): Promise<string | null> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return null;

  const reader = request.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendRSVPNotification(data: RSVPSubmission, createdAt: Date): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;
  if (!apiKey || !from || !to) return;

  const statusLabel = {
    attending: "Hadir",
    not_attending: "Tidak Hadir",
    maybe: "Belum Pasti",
  }[data.status];
  const values = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email || "-"),
    whatsapp: escapeHtml(data.whatsapp || "-"),
    guests: String(data.guests),
    status: statusLabel,
    message: escapeHtml(data.message || "-"),
    timestamp: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Makassar",
    }).format(createdAt),
  };

  const rows = [
    ["Nama Tamu", values.name],
    ["Email", values.email],
    ["WhatsApp", values.whatsapp],
    ["Jumlah Tamu", `${values.guests} orang`],
    ["Status Kehadiran", values.status],
    ["Ucapan & Doa", values.message],
    ["Waktu Pengiriman", `${values.timestamp} WITA`],
  ];
  const html = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e8dfcc;color:#777">${label}</td><td style="padding:10px 0;border-bottom:1px solid #e8dfcc">${value}</td></tr>`,
    )
    .join("");

  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `RSVP: ${data.name.replace(/[\r\n]/g, " ")} — ${statusLabel}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;padding:24px;color:#43544b"><h1 style="font-weight:400">Konfirmasi Kehadiran Baru</h1><table style="width:100%;border-collapse:collapse">${html}</table><p style="color:#7e8275">Notifikasi dari Undangan Pernikahan Digital</p></div>`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!result.ok) {
    console.error("RSVP saved but Resend returned status", result.status);
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceRoleKey) {
    console.error("Supabase server environment is not configured.");
    return response(false, "Layanan konfirmasi belum tersedia. Silakan coba kembali.", 503);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown";
  const ipHash = createHmac("sha256", serviceRoleKey).update(ipAddress).digest("hex");
  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "consume_rsvp_rate_limit",
    { p_ip_hash: ipHash, p_limit: RATE_LIMIT_PER_MINUTE },
  );

  if (rateLimitError) {
    console.error("RSVP rate-limit check failed:", rateLimitError.message);
    return response(false, "Layanan konfirmasi belum tersedia. Silakan coba kembali.", 503);
  }

  if (!allowed) {
    return response(
      false,
      "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      429,
      { "Retry-After": "60" },
    );
  }

  const body = await readBodyWithinLimit(request);
  if (body === null) {
    return response(false, "Data tidak valid. Periksa kembali formulir Anda.", 400);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return response(false, "Data tidak valid. Periksa kembali formulir Anda.", 400);
  }

  const validation = validateRSVP(parsed);
  if (!validation.success) return response(false, validation.message, 400);

  const data = validation.data;
  const requestId = data.requestId || randomUUID();
  const createdAt = new Date();
  const { error: insertError } = await supabase.from("rsvps").insert({
    request_id: requestId,
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    guests: data.guests,
    status: data.status,
    message: data.message,
    publish: data.publish,
    created_at: createdAt.toISOString(),
  });

  if (insertError?.code === "23505") {
    return response(true, "Konfirmasi Anda sudah tersimpan. Terima kasih!");
  }

  if (insertError) {
    console.error("Unable to save RSVP:", insertError.message);
    return response(false, "Konfirmasi belum dapat disimpan. Silakan coba lagi.", 503);
  }

  try {
    await sendRSVPNotification(data, createdAt);
  } catch (error) {
    console.error(
      "RSVP saved but email notification failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  return response(
    true,
    "Terima kasih! Konfirmasi kehadiran Anda telah diterima dan tersimpan.",
  );
}
