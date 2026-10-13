import { getTranslations } from "next-intl/server";
import { Container, buttonClass } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Container className="py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-6">{t("body")}</p>
      <Link href="/shop" className={buttonClass("primary", "mt-6")}>
        {t("cta")}
      </Link>
    </Container>
  );
}
