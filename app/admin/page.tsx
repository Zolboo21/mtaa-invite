import { getAllGuests } from "@/lib/guests";
import AdminGuests from "@/components/AdminGuests";
import { listRsvps, storageMode } from "@/lib/store";
import { event } from "@/data/event";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const sp = await searchParams;
  const adminKey = process.env.ADMIN_KEY;

  if (adminKey && sp.key !== adminKey) {
    return (
      <main style={gate}>
        <div style={gateCard}>
          <h1 style={{ fontSize: 22, margin: "0 0 8px", fontWeight: 600 }}>
            Админ нэвтрэх
          </h1>
          <p style={{ color: C.ink3, margin: "0 0 18px", fontSize: 14 }}>
            Үргэлжлүүлэхийн тулд нууц түлхүүрээ оруулна уу.
          </p>
          <form method="get">
            <input name="key" type="password" placeholder="Нууц түлхүүр" style={input} autoFocus />
            <button type="submit" style={btn}>Нэвтрэх</button>
          </form>
        </div>
      </main>
    );
  }

  const guests = await getAllGuests();
  const rows = await listRsvps();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const yes = rows.filter((r) => r.status === "yes").length;
  const no = rows.filter((r) => r.status === "no").length;
  const pending = guests.filter((g) => !bySlug.has(g.slug)).length;

  return (
    <main style={page}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
          <h1 style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Ирцийн бүртгэл — {event.deptShort} {event.years} жил
          </h1>
          <span style={{ fontSize: 13, color: C.ink3 }}>
            Хадгалалт: {storageMode() === "redis" ? "Vercel KV" : "локал файл"}
          </span>
        </div>

        <div style={statsRow}>
          <Stat v={guests.length} l="Нийт урисан" />
          <Stat v={yes} l="Ирнэ" c={C.accent} />
          <Stat v={no} l="Ирэхгүй" c="#b4432f" />
          <Stat v={pending} l="Хариулаагүй" c={C.ink3} />
        </div>

        <AdminGuests
          guests={guests}
          rsvps={rows.map((r) => ({ slug: r.slug, status: r.status, message: r.message, updatedAt: r.updatedAt }))}
          adminKey={adminKey ? sp.key : undefined}
          defaultNote={event.invitationText}
        />
      </div>
    </main>
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

function Stat({ v, l, c }: { v: number; l: string; c?: string }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: 40, fontWeight: 300, color: c || C.ink, lineHeight: 1, fontFamily: "Georgia, serif" }}>
        {v}
      </div>
      <div style={{ fontSize: 13.5, color: C.ink3, marginTop: 8 }}>{l}</div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: C.paper,
  color: C.ink,
  fontFamily: "Manrope, system-ui, sans-serif",
};
const statsRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
  margin: "28px 0 36px",
};
const statCard: React.CSSProperties = {
  background: C.paper2,
  border: `1px solid ${C.line2}`,
  borderRadius: 10,
  padding: "22px 20px",
};
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "13px 14px",
  fontSize: 12.5,
  color: C.ink3,
  fontWeight: 600,
};
const td: React.CSSProperties = { padding: "14px", fontSize: 14.5, verticalAlign: "top" };
const gate: React.CSSProperties = {
  minHeight: "100vh",
  background: C.paper,
  color: C.ink,
  display: "grid",
  placeItems: "center",
  fontFamily: "Manrope, system-ui, sans-serif",
  padding: 20,
};
const gateCard: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.line2}`,
  borderRadius: 14,
  padding: 32,
  width: "100%",
  maxWidth: 360,
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: `1px solid ${C.line}`,
  background: C.paper,
  color: C.ink,
  marginBottom: 12,
  fontSize: 15,
  boxSizing: "border-box",
};
const btn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: C.ink,
  color: C.paper,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};
const code: React.CSSProperties = {
  background: C.paper2,
  padding: "2px 7px",
  borderRadius: 5,
  fontSize: 12.5,
};
