import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { site } from "../../../config/site";
import { Analytics } from "@/components/analytics";
import { CookieNotice } from "@/components/cookie-notice";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TopBar } from "@/components/top-bar";
import { SiteLoader } from "@/components/site-loader";
import { UtmCapture } from "@/components/utm-capture";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";
import "../globals.css";

const latin = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1b1e22",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === "ar" ? "ar" : "en") as Locale;
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.name[loc],
      template: `%s · ${site.name[loc]}`,
    },
    description: t("homeDescription"),
    icons: {
      icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${latin.variable} ${arabic.variable}`}>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2"
          >
            {t("skip")}
          </a>
          <Suspense fallback={null}>
            <SiteLoader />
          </Suspense>
          <TopBar />
          <Header />
          <CookieNotice />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFab />
          <Suspense fallback={null}>
            <UtmCapture />
          </Suspense>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
