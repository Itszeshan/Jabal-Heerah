import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order-confirmation";
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
  return pageMetadata(loc, "/checkout/confirmation", t("confirmationTitle"), t("confirmationDescription"));
}

export default async function ConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("confirmation");
  return (
    <Container className="py-8 md:py-10">
      <h1 className="mb-6 text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <Suspense fallback={<div className="min-h-40 border border-line bg-white" />}>
        <OrderConfirmation />
      </Suspense>
    </Container>
  );
}
