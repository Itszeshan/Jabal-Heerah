import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui";
import { getFaq, text } from "@/lib/catalog";
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
  return pageMetadata(loc, "/faq", t("faqTitle"), t("faqDescription"));
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations("faq");
  const common = await getTranslations("common");
  const faq = getFaq();

  return (
    <Container className="py-8 md:py-10">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("intro")}</p>
      <div className="mt-8 max-w-3xl border-b border-line">
        {faq.map((item) => (
          <details key={item.id} className="border-t border-line py-4">
            <summary className="cursor-pointer text-lg font-semibold">{text(item.question, loc)}</summary>
            <p className="mt-3 max-w-prose text-sm leading-7">{text(item.answer, loc)}</p>
            {item.placeholder ? <p className="mt-2 text-xs font-semibold">{common("placeholder")}</p> : null}
          </details>
        ))}
      </div>
    </Container>
  );
}
