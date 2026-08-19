import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-v2.png`;

  return {
    title: "Labor jegyzőkönyv | Enzimtisztítás",
    description: "ClickUpba beágyazható, kitölthető NanoBioTech laborjegyzőkönyv-sablon.",
    openGraph: {
      title: "Enzimtisztítás | Digitális laborjegyzőkönyv",
      description: "Kitölthető NanoBioTech laborjegyzőkönyv-sablon.",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: "Enzimtisztítás | Digitális laborjegyzőkönyv",
      description: "Kitölthető NanoBioTech laborjegyzőkönyv-sablon.",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
