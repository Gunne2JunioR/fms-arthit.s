import { describe, it, expect } from "vitest";
import { UI_MESSAGES } from "./index";
import { MESSAGES as core } from "./messages/core";
import { MESSAGES as identity } from "@/features/identity/messages";
import { ALL_PERMISSIONS } from "@/permissions";
import { LOCALES } from "@/shared/lib/i18n/config";
import type { Dictionary } from "@/shared/lib/i18n/translate";

const DICTIONARIES: { name: string; messages: Dictionary }[] = [
  { name: "core", messages: core },
  { name: "identity", messages: identity },
];

describe("UI_MESSAGES", () => {
  it("key ไม่ซ้ำข้ามพจนานุกรม", () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const d of DICTIONARIES) {
      for (const k of Object.keys(d.messages)) {
        if (seen.has(k)) dup.push(`${k} (${seen.get(k)} ↔ ${d.name})`);
        else seen.set(k, d.name);
      }
    }
    expect(dup).toEqual([]);
  });

  it("ทุก key มีทั้ง th และ en", () => {
    for (const [k, v] of Object.entries(UI_MESSAGES)) {
      for (const locale of ["th", "en"] as const) expect(v[locale], `${k}.${locale}`).toBeTruthy();
    }
  });

  it("ทุกสิทธิ์ใน ALL_PERMISSIONS มี perm.<code> และ roles.module.<module> ครบทั้งสองภาษาหลัก", () => {
    const missing: string[] = [];
    const keys = new Set([...ALL_PERMISSIONS.map((p) => `perm.${p.code}`), ...ALL_PERMISSIONS.map((p) => `roles.module.${p.module}`)]);
    for (const key of keys) {
      const entry = UI_MESSAGES[key];
      if (!entry) { missing.push(key); continue; }
      for (const locale of ["th", "en"] as const) if (!entry[locale]) missing.push(`${key}.${locale}`);
    }
    expect(missing).toEqual([]);
  });

  it("LOCALES มี th, en, cn และ fallback ทำงานอย่างถูกต้อง", () => {
    expect(LOCALES).toContain("cn");
    expect(UI_MESSAGES["portal.home"]?.cn).toBe("首页");
  });
});
