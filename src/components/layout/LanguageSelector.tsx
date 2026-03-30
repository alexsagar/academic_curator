"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const changeLocale = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    router.refresh();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
      >
        <Icon name="language" className="text-[20px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-lg">
          <button
            type="button"
            onClick={() => changeLocale("en")}
            className="w-full px-4 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-low"
          >
            English (EN)
          </button>
          <button
            type="button"
            onClick={() => changeLocale("ar")}
            className="w-full px-4 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-low"
            dir="rtl"
          >
            العربية (AR)
          </button>
        </div>
      )}
    </div>
  );
}
