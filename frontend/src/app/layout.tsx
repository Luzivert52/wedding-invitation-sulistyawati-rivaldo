import type { Metadata, Viewport } from "next";
import { weddingConfig } from "@/lib/config";
import "@/styles/floral-experience.css";
import "@/styles/motion.css";
import "@/styles/photo-view.css";

export const metadata: Metadata = {
  title: weddingConfig.siteTitle,
  description: weddingConfig.siteDescription,
  openGraph: {
    title: weddingConfig.siteTitle,
    description: weddingConfig.siteDescription,
    type: "website",
    locale: "id_ID",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#577e7b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <link rel="preload" href="/images/floral-valley.webp" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
