export const DEFAULT_GUEST = "Bapak/Ibu/Saudara/i";
export function getGuestName(value: string | null): string {
  return (
    value
      ?.replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || DEFAULT_GUEST
  );
}
