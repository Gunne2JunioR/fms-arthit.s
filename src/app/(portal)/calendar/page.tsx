import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarClient } from "./_components/calendar-client";

export default async function CalendarPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 max-w-5xl">
      {/* Header Breadcrumb */}
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("portal.home")}</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t("calendar.title")}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t("calendar.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Interactive Client */}
      <CalendarClient locale={locale} />
    </div>
  );
}
