import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f2f4f6", color: "#121417", fontFamily: "sans-serif" }}>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 16px" }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.1 }}>This page is not here</h1>
          <p>The link may be old, or the product was removed.</p>
          <p>
            <Link href="/en">English shop</Link>
            {" · "}
            <Link href="/ar">المتجر بالعربية</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
