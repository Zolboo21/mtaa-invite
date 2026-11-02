"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

type Guest = { slug: string; name: string; title?: string; note?: string; vip?: boolean; source: "file" | "admin" };
type Rsvp = { slug: string; status: "yes" | "no"; message?: string; updatedAt: string };
type Form = { name: string; title: string; note: string; vip: boolean };

const empty: Form = { name: "", title: "", note: "", vip: false };

/** Admin: create personal invite links, list them with RSVP status, edit/delete, copy/export. */
export default function AdminGuests({
  guests,
  rsvps,
  adminKey,
  defaultNote,
}: {
  guests: Guest[];
  rsvps: Rsvp[];
  adminKey?: string;
  defaultNote: string;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Guest | null>(null);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);
  const link = (slug: string) => `${origin}/${slug}`;
  const bySlug = useMemo(() => new Map(rsvps.map((r) => [r.slug, r])), [rsvps]);

  useEffect(() => {
    if (!created || !origin) return;
    QRCode.toDataURL(link(created.slug), { margin: 1, width: 360, color: { dark: "#12282a", light: "#ffffff" } }).then(setQr);
  }, [created, origin]); // eslint-disable-line react-hooks/exhaustive-deps

  const headers = { "Content-Type": "application/json", ...(adminKey ? { "x-admin-key": adminKey } : {}) };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/guests", {
        method: editing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({ ...form, slug: editing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа.");
      if (!editing) setCreated(data.guest);
      setForm(empty);
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(g: Guest) {
    if (!confirm(`${g.name} — урилгыг устгах уу? Линк ажиллахаа болино.`)) return;
    const res = await fetch(`/api/guests?slug=${encodeURIComponent(g.slug)}`, { method: "DELETE", headers });
    if (res.ok) {
      if (created?.slug === g.slug) setCreated(null);
      router.refresh();
    }
  }

  function edit(g: Guest) {
    setEditing(g.slug);
    setCreated(null);
    setForm({ name: g.name, title: g.title ?? "", note: g.note ?? "", vip: !!g.vip });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  }

  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [["Нэр", "Албан тушаал", "Линк", "Хариу"]].concat(
      guests.map((g) => {
        const r = bySlug.get(g.slug);
        return [g.name, g.title ?? "", link(g.slug), r ? (r.status === "yes" ? "Ирнэ" : "Ирэхгүй") : "Хүлээгдэж буй"];
      }),
    );
    const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mtaa-invite-links.csv";
    a.click();
  }

  const allLinks = guests.map((g) => `${g.name} — ${link(g.slug)}`).join("\n");

  return (
    <div>
      {/* ---------- create / edit ---------- */}
      <form onSubmit={submit} style={card}>
        <h2 style={h2}>{editing ? "Зочны мэдээлэл засах" : "Шинэ зочин нэмэх · линк үүсгэх"}</h2>
        <div style={grid2}>
          <label style={lbl}>
            Нэр *
            <input style={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Жишээ: Д.Ганбат" required />
          </label>
          <label style={lbl}>
            Албан тушаал
            <input style={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Жишээ: Хэлтсийн дарга" />
          </label>
        </div>
        <label style={lbl}>
          Хувийн мессеж (хоосон бол үндсэн урилгын бичвэр гарна)
          <textarea style={{ ...inp, minHeight: 84, resize: "vertical" }} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={defaultNote} />
        </label>
        <label style={{ ...lbl, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} />
          Эрхэм хүндэт зочин (VIP)
        </label>
        {error ? <p style={{ color: "#b4432f", margin: "4px 0 10px", fontSize: 14 }}>{error}</p> : null}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnPrimary} disabled={busy}>
            {busy ? "Хадгалж байна…" : editing ? "Хадгалах" : "Линк үүсгэх"}
          </button>
          {editing ? (
            <button type="button" style={btnGhost} onClick={() => (setEditing(null), setForm(empty))}>
              Болих
            </button>
          ) : null}
        </div>
      </form>

      {/* ---------- just created ---------- */}
      {created ? (
        <div style={{ ...card, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", borderColor: C.accent }}>
          {qr ? <img src={qr} alt={`QR: ${created.name}`} width={140} height={140} style={{ borderRadius: 8 }} /> : null}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 13, color: C.ink3 }}>Урилгын линк бэлэн боллоо</div>
            <div style={{ fontWeight: 700, fontSize: 18, margin: "4px 0 10px" }}>{created.name}</div>
            <code style={linkBox}>{link(created.slug)}</code>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button style={btnPrimary} onClick={() => copy(link(created.slug), "new")}>
                {copied === "new" ? "Хуулагдлаа ✓" : "Линк хуулах"}
              </button>
              <a style={btnGhost} href={`/${created.slug}`} target="_blank" rel="noreferrer">
                Урилгыг нээх ↗
              </a>
              {qr ? (
                <a style={btnGhost} href={qr} download={`${created.slug}-qr.png`}>
                  QR татах
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------- list ---------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "34px 0 12px" }}>
        <h2 style={{ ...h2, margin: 0 }}>Бүх урилга ({guests.length})</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnGhost} onClick={() => copy(allLinks, "all")}>
            {copied === "all" ? "Хуулагдлаа ✓" : "Бүх линк хуулах"}
          </button>
          <button style={btnGhost} onClick={exportCsv}>
            CSV татах
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr>
              {["Нэр", "Линк", "Хариу", "Мессеж", ""].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => {
              const r = bySlug.get(g.slug);
              const color = r?.status === "yes" ? C.accent : r?.status === "no" ? "#b4432f" : C.ink3;
              const label = r?.status === "yes" ? "Ирнэ" : r?.status === "no" ? "Ирэхгүй" : "Хүлээгдэж буй";
              return (
                <tr key={g.slug} style={{ borderTop: `1px solid ${C.line2}` }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>
                      {g.name} {g.vip ? <span style={vip}>VIP</span> : null}
                    </div>
                    {g.title ? <div style={{ fontSize: 12.5, color: C.ink3 }}>{g.title}</div> : null}
                  </td>
                  <td style={td}>
                    <a href={`/${g.slug}`} target="_blank" rel="noreferrer" style={{ color: C.accent }}>
                      /{g.slug}
                    </a>
                    <button style={mini} onClick={() => copy(link(g.slug), g.slug)}>
                      {copied === g.slug ? "✓" : "Хуулах"}
                    </button>
                  </td>
                  <td style={{ ...td, color, fontWeight: 600 }}>{label}</td>
                  <td style={{ ...td, maxWidth: 240, color: C.ink2, fontSize: 14 }}>{r?.message || "—"}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <button style={mini} onClick={() => edit(g)}>
                      Засах
                    </button>
                    <button style={{ ...mini, color: "#b4432f" }} onClick={() => remove(g)}>
                      Устгах
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const C = {
  paper: "#eef2f1",
  paper2: "#e3e9e8",
  ink: "#12282a",
  ink2: "#4b6467",
  ink3: "#809699",
  accent: "#0c6f6a",
  line: "rgba(18,40,42,0.16)",
  line2: "rgba(18,40,42,0.08)",
};
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 22, marginBottom: 16 };
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: "0 0 16px" };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const lbl: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: C.ink2, marginBottom: 12 };
const inp: React.CSSProperties = {
  font: "inherit",
  fontSize: 15,
  padding: "11px 13px",
  borderRadius: 8,
  border: `1px solid ${C.line}`,
  background: C.paper,
  color: C.ink,
};
const btnPrimary: React.CSSProperties = {
  font: "inherit",
  fontWeight: 600,
  fontSize: 14.5,
  padding: "11px 18px",
  borderRadius: 8,
  border: "none",
  background: C.ink,
  color: "#fff",
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  ...btnPrimary,
  background: "transparent",
  color: C.ink,
  border: `1px solid ${C.line}`,
  textDecoration: "none",
  display: "inline-block",
};
const mini: React.CSSProperties = {
  font: "inherit",
  fontSize: 12.5,
  marginLeft: 8,
  padding: "4px 9px",
  borderRadius: 6,
  border: `1px solid ${C.line}`,
  background: "transparent",
  color: C.ink2,
  cursor: "pointer",
};
const linkBox: React.CSSProperties = {
  display: "block",
  background: C.paper,
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  wordBreak: "break-all",
};
const vip: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  color: "#7a5a12",
  background: "#f6dd8f",
  borderRadius: 4,
  padding: "1px 6px",
  marginLeft: 4,
};
const th: React.CSSProperties = { textAlign: "left", padding: "13px 14px", fontSize: 12.5, color: C.ink3, fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px", fontSize: 14.5, verticalAlign: "top" };
