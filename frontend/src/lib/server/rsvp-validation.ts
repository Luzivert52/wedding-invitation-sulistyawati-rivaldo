export interface RSVPSubmission {
  name: string;
  email: string;
  whatsapp: string;
  guests: number;
  status: "attending" | "not_attending" | "maybe";
  message: string;
  publish: boolean;
  requestId: string;
}

export type RSVPValidation =
  | { success: true; data: RSVPSubmission }
  | { success: false; message: string };

const allowedFields = new Set([
  "name",
  "email",
  "whatsapp",
  "guests",
  "status",
  "message",
  "publish",
  "request_id",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function runeCount(value: string): number {
  return Array.from(value).length;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function validateRSVP(value: unknown): RSVPValidation {
  if (!isRecord(value) || Object.keys(value).some((key) => !allowedFields.has(key))) {
    return {
      success: false,
      message: "Data tidak valid. Periksa kembali formulir Anda.",
    };
  }

  const name = value.name === undefined ? "" : value.name;
  const email = value.email === undefined ? "" : value.email;
  const whatsapp = value.whatsapp === undefined ? "" : value.whatsapp;
  const guests = value.guests === undefined ? 0 : value.guests;
  const status = value.status === undefined ? "" : value.status;
  const message = value.message === undefined ? "" : value.message;
  const publish = value.publish === undefined ? false : value.publish;
  const requestId = value.request_id === undefined ? "" : value.request_id;

  if (
    !isString(name) ||
    !isString(email) ||
    !isString(whatsapp) ||
    !isString(status) ||
    !isString(message) ||
    typeof guests !== "number" ||
    !Number.isInteger(guests) ||
    typeof publish !== "boolean" ||
    !isString(requestId)
  ) {
    return {
      success: false,
      message: "Data tidak valid. Periksa kembali formulir Anda.",
    };
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const normalizedWhatsApp = whatsapp.trim();
  const normalizedMessage = message.trim();
  const normalizedStatus = status.trim();

  if (byteLength(requestId) > 100) {
    return { success: false, message: "Identitas pengiriman tidak valid." };
  }

  if (!normalizedName || runeCount(normalizedName) > 100) {
    return {
      success: false,
      message: "Nama wajib diisi (maksimal 100 karakter).",
    };
  }

  if (!["attending", "not_attending", "maybe"].includes(normalizedStatus)) {
    return { success: false, message: "Status kehadiran tidak valid." };
  }

  if (
    (normalizedStatus === "not_attending" && guests !== 0) ||
    (normalizedStatus !== "not_attending" && (guests < 1 || guests > 20))
  ) {
    return {
      success: false,
      message: "Jumlah tamu harus 0 untuk tidak hadir, atau 1–20 untuk hadir/belum pasti.",
    };
  }

  if (
    normalizedEmail &&
    (byteLength(normalizedEmail) > 150 ||
      !/^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(normalizedEmail))
  ) {
    return { success: false, message: "Format email tidak valid." };
  }

  if (runeCount(normalizedMessage) > 500) {
    return { success: false, message: "Ucapan maksimal 500 karakter." };
  }

  if (runeCount(normalizedWhatsApp) > 20) {
    return { success: false, message: "Nomor WhatsApp terlalu panjang." };
  }

  return {
    success: true,
    data: {
      name: normalizedName,
      email: normalizedEmail,
      whatsapp: normalizedWhatsApp,
      guests,
      status: normalizedStatus as RSVPSubmission["status"],
      message: normalizedMessage,
      publish: publish && normalizedMessage.length > 0,
      requestId,
    },
  };
}
