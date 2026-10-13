import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout-form";
import { Container } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import type { Locale } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  return pageMetadata(loc, "/checkout", t("checkoutTitle"), t("checkoutDescription"));
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  return (
    <Container className="py-8 md:py-10">
      <h1 className="mb-6 text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <CheckoutForm />
    </Container>
  );
}
