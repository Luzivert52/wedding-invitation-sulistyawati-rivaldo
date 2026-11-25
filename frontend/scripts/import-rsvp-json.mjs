import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourcePath = process.argv[2];
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!sourcePath) {
  console.error("Usage: node frontend/scripts/import-rsvp-json.mjs <path-to-rsvps.json>");
  process.exitCode = 1;
} else if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exitCode = 1;
} else {
  const contents = await readFile(resolve(sourcePath), "utf8");
  const records = JSON.parse(contents);

  if (!Array.isArray(records)) {
    throw new Error("The RSVP export must be a JSON array.");
  }

  const rows = records.map((record) => {
    if (
      !record ||
      typeof record.id !== "string" ||
      typeof record.name !== "string" ||
      typeof record.email !== "string" ||
      typeof record.whatsapp !== "string" ||
      !Number.isInteger(record.guests) ||
      !["attending", "not_attending", "maybe"].includes(record.status) ||
      typeof record.message !== "string" ||
      typeof record.publish !== "boolean" ||
      typeof record.timestamp !== "string" ||
      !Number.isFinite(Date.parse(record.timestamp))
    ) {
      throw new Error("The RSVP export contains a record with an invalid shape.");
    }

    return {
      request_id: record.id,
      name: record.name,
      email: record.email,
      whatsapp: record.whatsapp,
      guests: record.guests,
      status: record.status,
      message: record.message,
      publish: record.publish && record.message.length > 0,
      created_at: new Date(record.timestamp).toISOString(),
    };
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  for (let offset = 0; offset < rows.length; offset += 100) {
    const batch = rows.slice(offset, offset + 100);
    const { error } = await supabase.from("rsvps").upsert(batch, {
      onConflict: "request_id",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error("RSVP import failed:", error.message);
      process.exitCode = 1;
      break;
    }
  }

  if (!process.exitCode) {
    console.log(`${rows.length} RSVP records processed; duplicate request IDs were ignored.`);
  }
}
