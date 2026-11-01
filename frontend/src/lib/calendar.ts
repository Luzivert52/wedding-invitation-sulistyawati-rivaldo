import { weddingConfig } from "./config";
function escapeICS(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function dateICS(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z/, "Z");
}
export function createWeddingCalendar() {
  const event = weddingConfig.events[0];
  const start = weddingConfig.weddingDate;
  const end = weddingConfig.calendar.end;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Floral Wedding//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:akad-${dateICS(start)}@floral-wedding.local`,
    `DTSTAMP:${dateICS(new Date().toISOString())}`,
    `DTSTART:${dateICS(start)}`,
    `DTEND:${dateICS(end)}`,
    `SUMMARY:${escapeICS(`${event.title} ${weddingConfig.bride.shortName} & ${weddingConfig.groom.shortName}`)}`,
    `LOCATION:${escapeICS(`${event.venue}, ${event.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];
  // RFC 5545: fold lines at 75 bytes without splitting UTF-8 characters.
  return lines
    .flatMap((line) => {
      const chunks: string[] = [];
      let part = "",
        bytes = 0;
      for (const char of line) {
        const size = new TextEncoder().encode(char).length;
        if (bytes + size > 75) {
          chunks.push(part);
          part = " ";
          bytes = 1;
        }
        part += char;
        bytes += size;
      }
      chunks.push(part);
      return chunks;
    })
    .join("\r\n");
}
export function downloadWeddingCalendar() {
  const url = URL.createObjectURL(
    new Blob([createWeddingCalendar()], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "akad-listy-aldo.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
