"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { LOCALES, type Locale } from "@/shared/lib/i18n/config";
import { useLocale } from "@/shared/lib/i18n/client";
import { setLocaleAction } from "@/features/identity/actions";
import { Button } from "@/components/ui/button";

/**
 * Locale switcher button — displays the active current language code (TH, EN, CN)
 * matching the currently displayed language. Clicking cycles to the next locale:
 * TH -> EN -> CN -> TH, writes the cookie, and refreshes the page.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Current active locale uppercase label: "TH" | "EN" | "CN"
  const currentLabel = (locale ?? "th").toUpperCase();

  // Next locale in cycle
  const nextLocale: Locale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

  const change = () => {
    if (pending) return;
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={change}
      disabled={pending}
      aria-label={`Current language: ${currentLabel}. Click to switch to ${nextLocale.toUpperCase()}`}
      title={`Current language: ${currentLabel}. Click to switch to ${nextLocale.toUpperCase()}`}
      className={cn("text-xs font-bold uppercase tracking-wider disabled:opacity-60", className)}
    >
      {currentLabel}
    </Button>
  );
}
