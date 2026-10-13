import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PhotoSlot } from "@/components/photo-slot";
import { ProductMedia } from "@/components/product-media";
import { Container } from "@/components/ui";
import { getAbout, text } from "@/lib/catalog";
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
  return pageMetadata(loc, "/about", t("aboutTitle"), t("aboutDescription"));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const about = getAbout();
  const t = await getTranslations("about");
  const common = await getTranslations("common");
  const paragraphs = text(about.body, loc).split("\n").filter((line) => line.trim());

  return (
    <Container className="py-8 md:py-10">
      <h1 className="text-4xl font-semibold tracking-tight">{text(about.title, loc)}</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold">{common("placeholder")}</p>
      <h2 className="mt-10 text-2xl font-semibold">{t("photos")}</h2>
      {about.photos.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {about.photos.map((photo) => (
            <ProductMedia key={photo} src={photo} alt={text(about.title, loc)} />
          ))}
        </div>
      ) : (
        <div className="mt-4 max-w-md border border-line">
          <PhotoSlot />
          <p className="bg-white p-3 text-sm">{t("photosEmpty")}</p>
        </div>
      )}
    </Container>
  );
}
