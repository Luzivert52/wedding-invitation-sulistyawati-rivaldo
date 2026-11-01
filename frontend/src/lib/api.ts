export interface RSVPPayload {
  name: string;
  email: string;
  whatsapp: string;
  guests: number;
  status: "attending" | "not_attending" | "maybe";
  message: string;
  publish?: boolean;
  request_id?: string;
}

export interface APIResponse {
  success: boolean;
  message: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface PublicWish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export async function getWishes(): Promise<PublicWish[]> {
  const res = await fetch(`${API_URL}/api/wishes`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Buku tamu belum dapat dimuat.");
  const data = (await res.json()) as { wishes: PublicWish[] };
  return data.wishes;
}

export async function submitRSVP(data: RSVPPayload): Promise<APIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch(`${API_URL}/api/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as APIResponse | null;

    if (!res.ok) {
      return {
        success: false,
        message: json?.message || "Terjadi kesalahan. Silakan coba lagi.",
      };
    }

    return json && typeof json.success === "boolean"
      ? json
      : {
        success: false,
        message:
          "Server mengembalikan respons yang belum dapat dibaca. Silakan coba kembali.",
      };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        message: "Permintaan terlalu lama. Periksa koneksi internet Anda.",
      };
    }
    return {
      success: false,
      message: "Tidak dapat terhubung ke server. Silakan coba lagi.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
