import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LoadingMark } from "@/components/loading-mark";

export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6">
        <Image src="/jabal-logo.png" alt="" width={989} height={525} className="h-32 w-auto" priority />
        <LoadingMark />
        <p className="text-sm text-muted">{t("loading")}</p>
      </div>
    </div>
  );
}
