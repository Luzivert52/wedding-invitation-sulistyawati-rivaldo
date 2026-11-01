"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { weddingConfig as config } from "@/lib/config";
import { submitRSVP, getWishes, type PublicWish, type RSVPPayload } from "@/lib/api";
import { downloadWeddingCalendar } from "@/lib/calendar";

type Phase = "closed" | "opening" | "open";
type Player = HTMLAudioElement;
type LightboxPhoto = { src: string; alt: string; galleryIndex?: number };
const photos: readonly string[] = config.gallery;
// Format all date artwork from the single event source, using WITA.
const eventDate = new Date(config.weddingDate);
const day = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Makassar" }).format(eventDate);
const month = new Intl.DateTimeFormat("id-ID", { month: "2-digit", timeZone: "Asia/Makassar" }).format(eventDate);
const year = new Intl.DateTimeFormat("id-ID", { year: "numeric", timeZone: "Asia/Makassar" }).format(eventDate);
const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "Asia/Makassar" }).format(eventDate).toUpperCase();
const longDate = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(eventDate).toUpperCase();
const petalData = Array.from({ length: 12 }, (_, i) => ({ x: (i * 37 + 11) % 100, delay: -i * 2.7, duration: 16 + i % 5 * 2, size: 9 + i % 3 * 3 }));

function guestFromURL() {
  return (new URLSearchParams(window.location.search).get("to") || "").replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
}

function Flowers({ curtain = false, className = "" }: { curtain?: boolean; className?: string; }) {
  const id = useId().replace(/:/g, "");
  const blooms = curtain
    ? Array.from({ length: 28 }, (_, i) => ({ x: 270 + Math.sin(i * 2.1) * 75, y: -20 + i * 39, s: .5 + i % 4 * .1, r: i * 39 }))
    : [{ x: 70, y: 100, s: .85, r: 10 }, { x: 137, y: 61, s: .65, r: 60 }, { x: 38, y: 170, s: .55, r: 90 }, { x: 187, y: 50, s: .42, r: 20 }, { x: 104, y: 157, s: .43, r: 40 }];
  return <svg className={className} viewBox={curtain ? "0 0 400 1000" : "0 0 260 280"} preserveAspectRatio={curtain ? "xMaxYMid slice" : "xMidYMid meet"} fill="none" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-pink`}><stop stopColor="#b9778d" /><stop offset=".5" stopColor="#e9b5c3" /><stop offset="1" stopColor="#f8e2e5" /></radialGradient>
      <radialGradient id={`${id}-ivory`}><stop stopColor="#d5b89b" /><stop offset=".5" stopColor="#f3e4d5" /><stop offset="1" stopColor="#fffaf2" /></radialGradient>
      <linearGradient id={`${id}-sage`}><stop stopColor="#c7d1b3" /><stop offset="1" stopColor="#839b7c" /></linearGradient>
      {["pink", "ivory"].map(color => <g id={`${id}-${color}-flower`} key={color}>
        {Array.from({ length: 9 }, (_, i) => <path key={i} d="M0 4C-47 2-62-25-37-43C-10-62 22-33 0 4Z" fill={`url(#${id}-${color})`} stroke={color === "pink" ? "#d79aaa" : "#dbc4ae"} strokeOpacity=".4" strokeWidth=".7" transform={`rotate(${i * 40})`} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={i} d="M0 1C-29-1-35-25-14-29C8-36 21-11 0 1Z" fill={color === "pink" ? "#e6acbd" : "#f2e4d7"} stroke={color === "pink" ? "#c78a9e" : "#cfb79e"} strokeWidth=".8" transform={`rotate(${i * 51 + 20})`} />)}
        <path d="M-13 5C-22-12 3-23 12-9C23 9-6 20-11 6C-16-4 4-11 8-1C10 7-3 11-5 4" stroke={color === "pink" ? "#b5768d" : "#bca080"} strokeWidth="2" />
      </g>)}
      <g id={`${id}-leaf`}><path d="M0 0C-42-39-40-71 0-89C25-49 21-20 0 0Z" fill={`url(#${id}-sage)`} /><path d="M0 0 0-77m0 33-13-16M0-30l12-18" stroke="#718a6e" strokeWidth="1.2" strokeOpacity=".5" /></g>
      <g id={`${id}-branch`}><path d="M0 110C0 44 17 8 37-30" stroke="#839c79" strokeWidth="1.5" />{Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${i * 4} ${78 - i * 18})`}><use href={`#${id}-leaf`} transform="rotate(-52) scale(.32)" /><use href={`#${id}-leaf`} transform="rotate(55) scale(.26)" /></g>)}</g>
    </defs>
    {curtain ? <><path d="M295-60C153 154 381 267 247 433S361 712 252 1050" stroke="#a4b492" strokeWidth="3" />{Array.from({ length: 18 }, (_, i) => <use key={i} href={`#${id}-branch`} transform={`translate(${235 + Math.cos(i) * 42} ${i * 60}) rotate(${i % 2 ? -50 : 55}) scale(.85)`} />)}</> : <><use href={`#${id}-branch`} transform="translate(18 170) rotate(13) scale(1.3)" /><use href={`#${id}-branch`} transform="translate(135 38) rotate(65) scale(.9)" /><use href={`#${id}-leaf`} transform="translate(100 120) rotate(55) scale(.8)" /></>}
    {blooms.map((b, i) => <use key={i} href={`#${id}-${i % 3 === 1 ? "ivory" : "pink"}-flower`} transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`} />)}
  </svg>;
}

function Divider() { return <div className="ff-divider" aria-hidden="true"><span />✿<span /></div>; }
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number; }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    el.classList.add("ff-pending");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { el.classList.add("ff-visible"); observer.unobserve(el); }
    }), { threshold: .06 });
    const update = () => { if (media.matches) { el.classList.add("ff-visible"); observer.disconnect(); } };
    observer.observe(el); media.addEventListener("change", update);
    return () => { observer.disconnect(); media.removeEventListener("change", update); el.classList.remove("ff-pending"); };
  }, []);
  return <div ref={ref} className="ff-reveal" style={{ "--ff-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(config.weddingDate).getTime();
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => { const next = Number.isFinite(target) ? Math.max(0, target - Date.now()) : 0; setLeft(next); if (!next && timer) clearInterval(timer); };
    const update = () => { if (timer) clearInterval(timer); tick(); if (!document.hidden && target > Date.now()) timer = setInterval(tick, 1000); };
    update(); document.addEventListener("visibilitychange", update);
    return () => { if (timer) clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const s = Math.floor((left || 0) / 1000);
  return <><div className="ff-countdown" aria-label="Hitung mundur menuju akad nikah">{[[Math.floor(s / 86400), "Hari"], [Math.floor(s / 3600) % 24, "Jam"], [Math.floor(s / 60) % 60, "Menit"], [s % 60, "Detik"]].map(([n, label]) => <div key={label}><strong>{left === null ? "—" : String(n).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>{left === 0 && <p className="ff-copy">Hari bahagia telah tiba. Terima kasih atas doa Anda.</p>}</>;
}

function Portrait({ src, name, initial, onOpen }: {
  src: string;
  name: string;
  initial?: string;
  onOpen: (button: HTMLButtonElement) => void;
}) {
  const [failed, setFailed] = useState(false);
  return <div className="ff-portrait"><div className="ff-portrait-inner">{src && !failed ? <button className="ff-portrait-view" type="button" aria-label={`Perbesar foto ${name}`} onClick={event => onOpen(event.currentTarget)}><img src={src} alt={`Foto ${name}`} loading="lazy" onError={() => setFailed(true)} /></button> : <><span className="ff-initial" aria-hidden="true">{initial || name.charAt(0)}</span><span className="ff-photo-note">Together, forever.</span></>}</div><Flowers className="ff-frame-flowers" /></div>;
}

function GalleryTile({ src, index, unavailable, onOpen, onUnavailable }: {
  src: string;
  index: number;
  unavailable: boolean;
  onOpen: (button: HTMLButtonElement) => void;
  onUnavailable: () => void;
}) {
  const label = `Foto prewedding ${config.bride.shortName} dan ${config.groom.shortName}, ${index + 1}`;
  return <button type="button" className="ff-gallery-item" disabled={unavailable}
    onClick={event => onOpen(event.currentTarget)}
    aria-label={unavailable ? `Foto prewedding ${index + 1} segera hadir` : `Perbesar foto prewedding ${index + 1}`}>
    <div className="ff-gallery-photo">
      {unavailable ? <div className="ff-gallery-placeholder">
        <Flowers className="ff-gallery-flower" />
        <span className="ff-gallery-monogram" aria-hidden="true">L<em>&amp;</em>A</span>
        <span>Foto segera hadir</span>
      </div> : <img src={src} alt={label} loading="lazy" decoding="async" onError={onUnavailable} />}
    </div>
    <span>{String(index + 1).padStart(2, "0")} / PREWEDDING <span aria-hidden="true">{unavailable ? "♡" : "↗"}</span></span>
  </button>;
}

function createMusicPlayer(): Player {
  const audio = new Audio(config.music.src);
  audio.loop = true;
  audio.volume = 0.3;
  audio.preload = "none";
  return audio;
}

function Icon({ name, size = 20 }: { name: string; size?: number; }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v11H3Z" /><path d="M9 21v-8h6v8" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    book: <><path d="M12 5v16M3 3c4 0 6 0 9 2 3-2 5-2 9-2v16c-4 0-6 0-9 2-3-2-5-2-9-2Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4m-9 7h3m4 0h3m-10 4h3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    music: <><path d="M9 18V5l11-2v13M9 8l11-2" /><ellipse cx="6" cy="18" rx="3" ry="2.5" /><ellipse cx="17" cy="16" rx="3" ry="2.5" /></>,
    pause: <><path d="M8 5v14m8-14v14" /></>,
    flower: <><path d="M12 9c-8-11-14 1-5 5-8 9 7 14 8 4 12 3 12-11 2-10 2-10-11-10-10-1" /><circle cx="12" cy="12" r="2" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    gallery: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.heart}</svg>;
}

function RSVPForm({ guest }: { guest: string; }) {
  const [form, setForm] = useState({ name: guest, email: "", whatsapp: "", status: "", guests: "1", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false), [result, setResult] = useState<{ ok: boolean; text: string; } | null>(null);
  const busy = useRef(false), ref = useRef<HTMLFormElement>(null);
  const [publish, setPublish] = useState(false);
  const requestID = useRef("");
  useEffect(() => { if (guest) setForm(previous => previous.name ? previous : { ...previous, name: guest }); }, [guest]);
  const change = (key: string, value: string) => { setForm(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: "" })); setResult(null); };
  async function send(event: FormEvent) {
    event.preventDefault(); if (busy.current || result?.ok) return;
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Mohon isi nama Anda.";
    if (!form.status) e.status = "Silakan pilih kehadiran Anda.";
    if (form.status !== "not_attending" && (!Number.isInteger(Number(form.guests)) || Number(form.guests) < 1 || Number(form.guests) > 20)) e.guests = "Jumlah tamu harus 1–20 orang.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Format email belum benar.";
    if (form.whatsapp.trim() && !/^\+?[0-9][0-9\s().-]{5,19}$/.test(form.whatsapp.trim())) e.whatsapp = "Periksa nomor WhatsApp Anda.";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      const field = ref.current?.querySelector<HTMLElement>(`[name="${first}"]`);
      const details = field?.closest("details");
      if (details) details.open = true;
      field?.focus(); return;
    }
    busy.current = true; setLoading(true); setResult(null);
    try {
      const response = await submitRSVP({ name: form.name.trim(), email: form.email.trim(), whatsapp: form.whatsapp.trim(), status: form.status as RSVPPayload["status"], guests: form.status === "not_attending" ? 0 : Number(form.guests), message: form.message.trim(), publish, request_id: requestID.current || (requestID.current = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("")) });
      setResult({ ok: response.success, text: response.message });
      if (response.success) window.dispatchEvent(new Event("floral-rsvp-sent"));
    } catch { setResult({ ok: false, text: "Konfirmasi belum terkirim. Silakan coba kembali." }); }
    finally { busy.current = false; setLoading(false); }
  }
  const error = (key: string) => errors[key] ? <p className="ff-error" id={`ff-error-${key}`}>{errors[key]}</p> : null;
  return <form ref={ref} onSubmit={send} className="ff-form" noValidate aria-busy={loading}>
    <fieldset disabled={loading || !!result?.ok}>
      <legend className="ff-sr">Formulir konfirmasi kehadiran</legend>
      <label htmlFor="ff-name">Nama lengkap <span>*</span></label><input id="ff-name" name="name" value={form.name} onChange={e => change("name", e.target.value)} maxLength={100} autoComplete="name" placeholder="Nama Anda dan keluarga" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "ff-error-name" : undefined} />{error("name")}
      <fieldset className="ff-attendance" aria-describedby={errors.status ? "ff-error-status" : undefined}>
        <legend>Apakah Anda akan hadir? <span>*</span></legend>
        {[{ value: "attending", label: "Dengan senang hati", sub: "Saya akan hadir" }, { value: "not_attending", label: "Mohon maaf", sub: "Belum bisa hadir" }, { value: "maybe", label: "Masih berencana", sub: "Belum pasti" }].map(option => <label className={`ff-choice ${form.status === option.value ? "ff-chosen" : ""}`} key={option.value}><input type="radio" name="status" value={option.value} checked={form.status === option.value} onChange={e => change("status", e.target.value)} required aria-invalid={!!errors.status} /><span><strong>{option.label}</strong><small>{option.sub}</small></span></label>)}
      </fieldset>{error("status")}
      <label htmlFor="ff-guests">Jumlah tamu <span>*</span></label><div className="ff-guest-field"><input id="ff-guests" name="guests" type="number" min={form.status === "not_attending" ? 0 : 1} max={20} step={1} value={form.status === "not_attending" ? "0" : form.guests} disabled={form.status === "not_attending"} onChange={e => change("guests", e.target.value)} inputMode="numeric" aria-invalid={!!errors.guests} aria-describedby={errors.guests ? "ff-error-guests" : "ff-guests-help"} /><span>orang</span></div>{error("guests")}<p className="ff-hint" id="ff-guests-help">{form.status === "not_attending" ? "Jumlah tamu otomatis 0 ketika tidak hadir." : "Termasuk Anda dan pendamping."}</p>
      <label htmlFor="ff-message">Ucapan &amp; doa <small>opsional</small></label><textarea id="ff-message" name="message" value={form.message} onChange={e => change("message", e.target.value)} rows={3} maxLength={500} placeholder="Sepotong doa untuk perjalanan kami…" aria-describedby="ff-message-count" /><p className="ff-character-count" id="ff-message-count">{form.message.length} / 500</p>
      <label className="ff-publish"><input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} /><span>Izinkan nama dan ucapan saya tampil di buku tamu.</span></label>
      <details className="ff-contact"><summary>Tambahkan kontak <span>opsional ＋</span></summary><div>
        <label htmlFor="ff-email">Email</label><input id="ff-email" name="email" type="email" value={form.email} onChange={e => change("email", e.target.value)} autoComplete="email" maxLength={150} placeholder="email@contoh.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "ff-error-email" : undefined} />{error("email")}
        <label htmlFor="ff-whatsapp">WhatsApp</label><input id="ff-whatsapp" name="whatsapp" type="tel" value={form.whatsapp} onChange={e => change("whatsapp", e.target.value)} autoComplete="tel" maxLength={20} placeholder="08xxxxxxxxxx" aria-invalid={!!errors.whatsapp} aria-describedby={errors.whatsapp ? "ff-error-whatsapp" : undefined} />{error("whatsapp")}
      </div></details>
      <button className="ff-button ff-submit" type="submit" disabled={loading || !!result?.ok}><span>{loading ? "Mengirim konfirmasi…" : result?.ok ? "Konfirmasi terkirim ✓" : "Kirim konfirmasi"}</span><Icon name="arrow" /></button>
    </fieldset>
    {result && <p className={`ff-result ${result.ok ? "ff-success" : "ff-failure"}`} role={result.ok ? "status" : "alert"}>{result.text}</p>}
    {result?.ok && <button type="button" className="ff-text-button" onClick={() => { setResult(null); requestID.current = ""; requestAnimationFrame(() => document.getElementById("ff-name")?.focus()); }}>Ubah dan kirim konfirmasi baru</button>}
    <p className="ff-privacy">Konfirmasi kehadiran diterima oleh pengelola. Ucapan ditampilkan hanya dengan izin Anda.</p>
  </form>;
}

function OrnateFrame() {
  return <svg className="ff-plaque" viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true"><path d="M30 148Q65 148 65 113V76H137Q150 76 154 58Q163 26 200 26Q237 26 246 58Q250 76 263 76H335V113Q335 148 370 148V552Q335 552 335 587V624H263Q250 624 246 642Q237 674 200 674Q163 674 154 642Q150 624 137 624H65V587Q65 552 30 552Z" fill="#faf5eb" stroke="#b29563" strokeWidth="2" /><path d="M42 160Q77 154 77 119V88H140Q160 88 166 61Q174 39 200 39Q226 39 234 61Q240 88 260 88H323V119Q323 154 358 160V540Q323 546 323 581V612H260Q240 612 234 639Q226 661 200 661Q174 661 166 639Q160 612 140 612H77V581Q77 546 42 540Z" fill="none" stroke="#b29563" strokeWidth=".8" /><path d="M175 104q25-26 50 0M183 107q17-16 34 0M175 596q25 26 50 0" fill="none" stroke="#b29563" /><circle cx="200" cy="98" r="3" fill="#b29563" /></svg>;
}
function GardenScene({ className = "" }: { className?: string; }) {
  return <div className={`ff-scene ${className}`} aria-hidden="true"><div className="ff-scene-landscape" /><div className="ff-scene-mist" /><img className="ff-scene-arch" src="/images/floral-arch.webp" alt="" width="1024" height="1536" /><div className="ff-scene-sparkles">{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ left: `${18 + i * 9}%`, top: `${20 + (i * 17) % 65}%`, animationDelay: `-${i * 1.7}s` }} />)}</div></div>;
}
function GuestBook() {
  const [wishes, setWishes] = useState<PublicWish[]>([]);
  const [state, setState] = useState("loading");
  const [limit, setLimit] = useState(4);
  async function load() { setState("loading"); try { setWishes(await getWishes()); setState("ready"); } catch { setState("error"); } }
  useEffect(() => { void load(); const update = () => void load(); window.addEventListener("floral-rsvp-sent", update); return () => window.removeEventListener("floral-rsvp-sent", update); }, []);
  return <div className="ff-guestbook" aria-live="polite">{state === "loading" ? <p className="ff-guestbook-empty">Membuka buku tamu…</p> : state === "error" ? <div className="ff-guestbook-empty"><p>Buku tamu belum dapat dimuat.</p><button type="button" className="ff-text-button" onClick={() => void load()}>Coba lagi ↻</button></div> : !wishes.length ? <div className="ff-guestbook-empty"><Icon name="mail" size={26} /><p>Sepucuk doa pertama,<br /><em>sebuah kenangan istimewa.</em></p><a className="ff-text-button" href="#rsvp">Tuliskan ucapan Anda ↑</a></div> : <>{wishes.slice(0, limit).map(wish => <article className="ff-wish" key={wish.id}><span className="ff-wish-initial">{Array.from(wish.name)[0]}</span><div><h3>{wish.name}</h3><time dateTime={wish.created_at}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date(wish.created_at))}</time><p>{wish.message}</p></div><span aria-hidden="true">♡</span></article>)}{wishes.length > limit && <button type="button" className="ff-text-button" onClick={() => setLimit(n => n + 6)}>Baca ucapan lainnya ↓</button>}</>}</div>;
}

export default function FloralExperience() {
  const [phase, setPhase] = useState<Phase>("closed"), [guest, setGuest] = useState("");
  const [active, setActive] = useState("hero"), [paused, setPaused] = useState(false), [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false), [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<LightboxPhoto | null>(null);
  const [failedPhotos, setFailedPhotos] = useState<readonly number[]>([]);
  const availablePhotos = photos.flatMap((src, index) => src.trim() && !failedPhotos.includes(index) ? [index] : []);
  const main = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement | null>(null), progress = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null), player = useRef<Player | null>(null), opening = useRef(false);
  const { bride, groom } = config;
  const notify = (text: string) => { setNotice(text); if (noticeTimer.current) clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(""), 4500); };
  useEffect(() => { setGuest(guestFromURL()); }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (phase !== "open") document.body.style.overflow = "hidden";
    if (main.current) main.current.inert = phase !== "open";
    return () => { document.body.style.overflow = previous; };
  }, [phase]);
  useEffect(() => {
    const update = () => { setVisible(!document.hidden); if (document.hidden && player.current && !player.current.paused) { player.current.pause(); setPlaying(false); } };
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (noticeTimer.current) clearTimeout(noticeTimer.current); if (player.current) { player.current.pause(); player.current.src = ""; } }, []);
  useEffect(() => {
    if (phase !== "open") return;
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const range = document.documentElement.scrollHeight - window.innerHeight; progress.current?.style.setProperty("--progress", String(range > 0 ? window.scrollY / range : 0)); }); };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [phase]);
  useEffect(() => {
    if (phase !== "open" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-12% 0px -55% 0px" });
    main.current?.querySelectorAll("section[id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [phase]);
  function finishOpening() { if (timer.current) clearTimeout(timer.current); setPhase("open"); requestAnimationFrame(() => main.current?.focus({ preventScroll: true })); }
  function open() {
    if (opening.current) return;
    opening.current = true; setPhase("opening"); window.scrollTo({ top: 0, behavior: "instant" });
    if (config.music.src) { if (!player.current) player.current = createMusicPlayer(); void player.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    timer.current = setTimeout(finishOpening, matchMedia("(prefers-reduced-motion: reduce)").matches ? 40 : 5400);
  }
  async function toggleMusic() {
    try {
      if (!player.current) player.current = createMusicPlayer();
      if (playing) { player.current.pause(); setPlaying(false); }
      else { await player.current.play(); setPlaying(true); }
    } catch { notify("Musik belum dapat diputar. Silakan coba kembali."); }
  }
  function showPhoto(index: number, button: HTMLButtonElement) {
    if (!availablePhotos.includes(index)) return;
    trigger.current = button;
    setSelected({
      src: photos[index],
      alt: `Foto prewedding ${bride.shortName} dan ${groom.shortName} ${index + 1}`,
      galleryIndex: index,
    });
    dialog.current?.showModal();
  }
  function showPortrait(src: string, name: string, button: HTMLButtonElement) {
    trigger.current = button;
    setSelected({ src, alt: `Foto ${name}` });
    dialog.current?.showModal();
  }
  function step(direction: number) {
    if (selected?.galleryIndex === undefined || !availablePhotos.length) return;
    const currentIndex = availablePhotos.indexOf(selected.galleryIndex);
    const nextIndex = availablePhotos[(currentIndex + direction + availablePhotos.length) % availablePhotos.length];
    setSelected({
      src: photos[nextIndex],
      alt: `Foto prewedding ${bride.shortName} dan ${groom.shortName} ${nextIndex + 1}`,
      galleryIndex: nextIndex,
    });
  }
  function saveDate() { downloadWeddingCalendar(); notify("Jadwal akad diunduh. Buka file untuk menambahkannya ke kalender."); }
  const navigation = [{ id: "hero", label: "Awal", icon: "home" }, { id: "couple", label: "Mempelai", icon: "heart" }, { id: "events", label: "Acara", icon: "calendar" }, { id: "gallery", label: "Galeri", icon: "gallery" }, { id: "rsvp", label: "RSVP", icon: "mail" }];
  return <div className={`ff-app ff-phase-${phase} ${paused || !visible ? "ff-paused" : ""}`}>
    {phase !== "open" && <section className={`ff-cover ${phase === "opening" ? "ff-opening" : ""}`} role="dialog" aria-modal="true" aria-labelledby="ff-cover-title" aria-busy={phase === "opening"} onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); document.querySelector<HTMLButtonElement>(phase === "opening" ? ".ff-skip-intro" : ".ff-open-button")?.focus(); } }}>
      <GardenScene className="ff-cover-scene" /><div className="ff-cover-veil" /><div className="ff-cover-top"><span>THE WEDDING INVITATION</span><span>{day} . {month} . {year}</span></div>
      <div className="ff-cover-letter"><OrnateFrame /><div className="ff-cover-letter-content"><span className="ff-small-monogram">L<span>&amp;</span>A</span><p className="ff-eyebrow">THE WEDDING OF</p><h1 id="ff-cover-title" className="ff-cover-names">{bride.shortName}<em>&amp;</em>{groom.shortName}</h1><div className="ff-cover-date">{config.weddingDateDisplay}</div><div className="ff-cover-guest"><span>Kepada Yth. Bapak/Ibu/Saudara/i</span><strong>{guest || "Tamu Istimewa"}</strong></div><button type="button" autoFocus className="ff-button ff-open-button" onClick={open} disabled={phase === "opening"}><Icon name="mail" size={15} /><span>Buka undangan</span></button><p className="ff-cover-note">Sebuah awal. Sebuah janji. Selamanya.</p></div></div>
      {phase === "opening" && <div className="ff-intro-controls"><span>Menuju taman janji kita…</span><button type="button" className="ff-skip-intro" onClick={finishOpening}>Lewati animasi <span>→</span></button></div>}
      <div className="ff-cover-bottom">A LOVE IN FULL BLOOM</div>
    </section>}
    {phase !== "closed" && <>
      <a href="#hero" className="ff-skip">Lewati ke isi undangan</a>
      <aside className="ff-desktop-garden" aria-label="Undangan pernikahan Listy dan Aldo"><GardenScene /><div className="ff-desktop-shade" /><div className="ff-garden-top"><span>THE WEDDING OF</span><span>{day} . {month} . {year}</span></div><div className="ff-garden-title"><span>IN THE GARDEN OF FOREVER</span><p>{bride.shortName} <em>&amp;</em> {groom.shortName}</p><div>Sabtu, {config.weddingDateDisplay.replace(/^Sabtu, /, "")}</div></div><div className="ff-garden-bottom"><span>A LOVE IN FULL BLOOM</span><span>TINGGEDE · WITA</span></div></aside>
      <div className="ff-progress" ref={progress} aria-hidden="true" />
      <div className="ff-petals ff-ambient" aria-hidden="true">{petalData.map((p, i) => <span key={i} style={{ left: `${p.x}%`, width: p.size, height: p.size * 1.4, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />)}</div>
      <main ref={main} className="ff-main" tabIndex={-1} aria-hidden={phase !== "open"}>
        <section className="ff-hero" id="hero"><div className="ff-hero-landscape" /><div className="ff-hero-inner"><OrnateFrame /><div className="ff-hero-content"><p className="ff-eyebrow">THE WEDDING OF</p><h1 className="ff-hero-names">{bride.shortName}<em>&amp;</em>{groom.shortName}</h1><Divider /><p className="ff-hero-subtitle">Bersama, dalam setiap musim.</p><p className="ff-hero-date">{day} . {month} . {year}</p><button type="button" className="ff-button ff-save-date" onClick={saveDate}>SAVE THE DATE <Icon name="calendar" size={13} /></button><a className="ff-scroll" href="#couple"><span>GULIR UNTUK MELIHAT</span><span>↓</span></a></div><Flowers className="ff-hero-flowers ff-flowers-left ff-ambient" /><Flowers className="ff-hero-flowers ff-flowers-right ff-ambient" /></div><img className="ff-hero-arch" src="/images/floral-arch.webp" alt="" width="1024" height="1536" /></section>
        <section className="ff-intro ff-section ff-teal"><Reveal><span className="ff-monogram-type">L<em>&amp;</em>A</span><p className="ff-eyebrow">A LOVE IN FULL BLOOM</p><p className="ff-intro-quote">Dari sebuah perkenalan,<br />menuju <em>seumur hidup.</em></p><Divider /><p className="ff-copy">Dengan penuh syukur dan sukacita, kami mengundang Anda untuk menjadi bagian dari hari ketika dua perjalanan menjadi satu.</p></Reveal></section>
        <section className="ff-section ff-couple-section ff-paper" id="couple"><Reveal><span className="ff-eyebrow">BISMILLAHIRRAHMANIRRAHIM</span><h2 className="ff-title ff-script-title">Assalamu’alaikum</h2><p className="ff-copy">Warahmatullahi Wabarakatuh</p><Divider /><p className="ff-copy">Dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan pernikahan:</p></Reveal><div className="ff-couple-grid">{[{ person: bride, src: config.images.bride, role: "MEMPELAI WANITA", child: "Putri dari" }, { person: groom, src: config.images.groom, role: "MEMPELAI PRIA", child: "Putra dari" }].map(({ person, src, role, child }, index) => <Reveal key={role} delay={index * 80}><article className="ff-person">{index > 0 && <div className="ff-person-amp">&amp;</div>}<Portrait src={src} name={person.fullName} initial={person.shortName.charAt(0)} onOpen={button => showPortrait(src, person.fullName, button)} /><p className="ff-eyebrow">{role}</p><h3>{person.fullName}</h3><p className="ff-copy">{child}<br /><strong>Bapak {person.father}</strong><br />&amp; Ibu {person.mother}</p></article></Reveal>)}</div></section>
        <section className="ff-countdown-section ff-section ff-teal"><Reveal><div className="ff-gold-ornament" aria-hidden="true">❦</div><p className="ff-eyebrow">COUNTING DOWN TO FOREVER</p><h2 className="ff-title">Save <em>the Date</em></h2><p className="ff-copy">Kami menanti hari istimewa ini,<br />bersama orang-orang terkasih.</p><Countdown /><button className="ff-button ff-button-light" type="button" onClick={saveDate}><Icon name="calendar" size={15} />Simpan tanggal akad</button></Reveal></section>
        <section className="ff-section ff-events-section ff-paper" id="events"><Reveal><p className="ff-eyebrow">THE CELEBRATION OF OUR LOVE</p><h2 className="ff-title ff-script-title">Janji &amp; perayaan</h2><p className="ff-copy">Kehadiran Anda melengkapi kebahagiaan kami.</p></Reveal><div className="ff-events">{config.events.map((event, i) => <Reveal key={event.title} delay={i * 80}><article className="ff-event"><Flowers className="ff-event-flowers" /><p className="ff-eyebrow">{i === 0 ? "THE SACRED PROMISE" : "THE JOYFUL CELEBRATION"}</p><h3>{event.title}</h3><Divider /><p className="ff-event-date">{event.date}</p><p className="ff-event-time">{event.time}</p><strong>{event.venue}</strong><p className="ff-copy">{event.address}</p><a className="ff-button" href={config.mapsUrl} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={14} />Lihat lokasi</a></article></Reveal>)}</div></section>
        <section className="ff-section ff-story-section ff-teal" id="story"><Reveal><p className="ff-eyebrow">THE CHAPTERS THAT BROUGHT US HERE</p><h2 className="ff-title ff-script-title">Our love story</h2><Divider /></Reveal><div className="ff-timeline">{config.story.map((item, i) => <Reveal key={item.title} delay={i * 70}><article className="ff-story"><span className="ff-story-number">{item.year}</span><h3>{item.title}</h3><div className="ff-story-copy">{item.text.map(text => <p key={text}>{text}</p>)}</div></article></Reveal>)}</div><p className="ff-story-footnote">What started as a simple introduction,<br />became a lifetime of love.</p></section>
        <section className="ff-section ff-gallery-section ff-paper" id="gallery"><Reveal><p className="ff-eyebrow">LITTLE MOMENTS, ETERNAL MEMORIES</p><h2 className="ff-title ff-script-title">Our gallery</h2><p className="ff-copy">Enam bingkai untuk kisah sebelum selamanya.</p></Reveal><div className="ff-gallery">{photos.map((src, index) => <Reveal key={`${src}-${index}`} delay={index % 2 * 80}><GalleryTile src={src} index={index} unavailable={!src.trim() || failedPhotos.includes(index)} onOpen={button => showPhoto(index, button)} onUnavailable={() => setFailedPhotos(previous => previous.includes(index) ? previous : [...previous, index])} /></Reveal>)}</div><p className="ff-gallery-caption">A moment in time. A lifetime in our hearts.</p></section>
        {config.streamingUrl && <section className="ff-section ff-streaming ff-teal"><Reveal><h2 className="ff-title ff-script-title">Live streaming</h2><p className="ff-copy">Saksikan hari bahagia kami dari mana pun Anda berada.</p><a className="ff-button ff-button-light" href={config.streamingUrl} target="_blank" rel="noopener noreferrer">Saksikan siaran ↗</a></Reveal></section>}
        {config.gifts.length > 0 && <section className="ff-section ff-gift-section ff-teal"><Reveal><p className="ff-eyebrow">A LITTLE TOKEN OF LOVE</p><h2 className="ff-title ff-script-title">Wedding gift</h2><p className="ff-copy">Doa restu Anda adalah hadiah yang paling berarti.</p><div className="ff-gifts">{config.gifts.map(gift => <article className="ff-gift" key={gift.bank + gift.account}><span>{gift.bank}</span><strong>{gift.account}</strong><p>a.n. {gift.name}</p><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(gift.account); notify("Nomor rekening berhasil disalin."); } catch { notify("Anda dapat memilih dan menyalin nomor rekeningnya."); } }}>Salin nomor rekening <Icon name="arrow" size={14} /></button></article>)}</div></Reveal></section>}
        <div className="ff-garden-interlude" role="img" aria-label="Ilustrasi taman bunga dan air terjun"><span>IN THE GARDEN OF FOREVER</span><p>My favourite place<br />is <em>next to you.</em></p></div>
        <section className="ff-section ff-rsvp-section ff-teal" id="rsvp"><Reveal><p className="ff-eyebrow">YOUR PRESENCE IS OUR PRESENT</p><h2 className="ff-title ff-script-title">Be our guest</h2><p className="ff-copy">Mohon konfirmasi kehadiran Anda.<br />Kami menyiapkan tempat istimewa untuk Anda.</p><Divider /></Reveal><Reveal delay={80}><RSVPForm guest={guest} /></Reveal></section>
        <section className="ff-section ff-wishes-section ff-teal" id="wishes"><Reveal><p className="ff-eyebrow">LITTLE NOTES, LOTS OF LOVE</p><h2 className="ff-title ff-script-title">Doa &amp; harapan</h2><p className="ff-copy">Setiap doa baik adalah hadiah yang kami kenang.</p></Reveal><GuestBook /></section>
        <footer className="ff-section ff-closing ff-paper"><Flowers className="ff-closing-flower ff-ambient" /><Reveal><span className="ff-monogram-type">L<em>&amp;</em>A</span><p className="ff-eyebrow">WITH LOVE &amp; GRATITUDE</p><h2 className="ff-title ff-script-title">Terima kasih</h2><p className="ff-copy">{config.closingMessage}</p><Divider /><p className="ff-closing-names">{bride.shortName} <em>&amp;</em> {groom.shortName}</p><div className="ff-closing-date">{day} . {month} . {year}</div><span className="ff-footer-note">A LOVE IN FULL BLOOM — FOREVER &amp; ALWAYS.</span></Reveal></footer>
      </main>
      {phase === "open" && <><nav className="ff-nav" aria-label="Navigasi undangan">{navigation.map(item => <a href={`#${item.id}`} key={item.id} className={active === item.id ? "ff-active" : ""} aria-current={active === item.id ? "location" : undefined}><Icon name={item.icon} size={18} /><span>{item.label}</span></a>)}</nav><details className="ff-tools"><summary aria-label="Musik dan pengaturan undangan" title="Musik dan pengaturan"><Icon name="flower" /><span className="ff-sr">Musik dan pengaturan</span></summary><div className="ff-tool-actions">{config.music.src && <button type="button" aria-label={playing ? "Jeda musik" : "Putar musik"} aria-pressed={playing} onClick={() => void toggleMusic()}><Icon name={playing ? "pause" : "music"} /></button>}<button type="button" aria-label={paused ? "Lanjutkan animasi bunga" : "Jeda animasi bunga"} aria-pressed={paused} onClick={() => setPaused(v => !v)}><Icon name={paused ? "pause" : "flower"} /></button><button type="button" aria-label="Salin tautan undangan" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); notify("Tautan undangan berhasil disalin."); } catch { notify("Silakan salin tautan dari bilah alamat browser."); } }}><Icon name="share" /></button></div></details></>}
    </>}
    <dialog ref={dialog} className="ff-lightbox" aria-label="Foto diperbesar" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} onClose={() => { setSelected(null); trigger.current?.focus(); }} onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } }}><button className="ff-lightbox-close" type="button" onClick={() => dialog.current?.close()} aria-label="Tutup foto">×</button>{selected && <><img className="ff-lightbox-photo" src={selected.src} alt={selected.alt} />{selected.galleryIndex !== undefined && <div className="ff-lightbox-footer"><button type="button" aria-label="Foto sebelumnya" onClick={() => step(-1)} disabled={availablePhotos.length < 2}>←</button><p aria-live="polite">{availablePhotos.indexOf(selected.galleryIndex) + 1} / {availablePhotos.length}</p><button type="button" aria-label="Foto berikutnya" onClick={() => step(1)} disabled={availablePhotos.length < 2}>→</button></div>}</>}</dialog>
    <p className={`ff-toast ${notice ? "ff-show" : ""}`} role="status">{notice}</p>
    <noscript><div className="ff-noscript"><h1>{bride.fullName} &amp; {groom.fullName}</h1><p>{config.weddingDateDisplay}</p><p>{config.events[0].venue}</p><p>Aktifkan JavaScript untuk membuka undangan interaktif.</p></div></noscript>
  </div>;
}
