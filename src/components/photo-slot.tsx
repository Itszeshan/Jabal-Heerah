import { getTranslations } from "next-intl/server";

const chips = ["#1b1e22", "#c44912", "#f7f7f8", "#5c6b73"];

export async function PhotoSlot({ className = "" }: { className?: string }) {
  const t = await getTranslations("common");
  return (
    <div className={`flex h-full min-h-48 flex-col justify-between bg-[#e6e9ed] p-3 ${className}`}>
      <p className="text-xs font-medium text-muted">{t("photoPlaceholder")}</p>
      <div className="grid grid-cols-4 gap-1" aria-hidden>
        {chips.map((color) => (
          <span key={color} className="h-10" style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  );
}

export function PhotoSlotStatic({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex h-full min-h-48 flex-col justify-between bg-[#e6e9ed] p-3 ${className}`}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="grid grid-cols-4 gap-1" aria-hidden>
        {chips.map((color) => (
          <span key={color} className="h-10" style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  );
}
