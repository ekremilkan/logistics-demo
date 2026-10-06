import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/Providers";
import de from "@/lib/i18n/de";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: de.meta.title,
  description: de.meta.description,
  applicationName: "Hafenkraft",
  keywords: ["Umzug Bremen", "Umzugsunternehmen", "Büroumzug", "Auslandsumzug", "Festpreis Umzug", "Moving company Germany"],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_GB"],
    siteName: "Hafenkraft",
    title: de.meta.title,
    description: de.meta.description,
  },
  twitter: { card: "summary_large_image", title: de.meta.title, description: de.meta.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1C1E1F",
  colorScheme: "dark light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: "Hafenkraft Umzüge & Transporte GmbH",
  foundingDate: "1987",
  telephone: "+49 421 98765 40",
  email: "hallo@hafenkraft.de",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Am Holzhafen 14",
    postalCode: "28217",
    addressLocality: "Bremen",
    addressCountry: "DE",
  },
  geo: { "@type": "GeoCoordinates", latitude: 53.0951, longitude: 8.7738 },
  areaServed: ["DE", "NL", "BE", "LU", "DK", "AT", "CH", "PL", "FR"],
  openingHours: ["Mo-Fr 07:00-19:00", "Sa 08:00-14:00"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${plexMono.variable} ${interTight.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
