import Link from "next/link";
import { event } from "@/data/event";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef2f1",
        color: "#12282a",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        fontFamily: "Manrope, system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 64, fontWeight: 300, lineHeight: 1 }}>
          20
        </div>
        <h1 style={{ fontSize: 22, margin: "16px 0 10px", fontWeight: 600 }}>
          Урилга олдсонгүй
        </h1>
        <p style={{ color: "#4b6467", lineHeight: 1.7, marginBottom: 26, fontSize: 16 }}>
          Хаяг буруу эсвэл хүчингүй байна. Та өөрт ирсэн хувийн линкээ дахин
          шалгана уу.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "13px 24px",
            borderRadius: 7,
            background: "#12282a",
            color: "#eef2f1",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Нүүр хуудас
        </Link>
        <p style={{ color: "#809699", fontSize: 13, marginTop: 28 }}>{event.dept}</p>
      </div>
    </main>
  );
}
