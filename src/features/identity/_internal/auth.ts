import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/shared/lib/infra/prisma";
import { env, googleOAuthConfigured, microsoftOAuthConfigured } from "@/shared/lib/infra/env";
import { verifyPassword } from "@/shared/lib/security/password";
import { logger } from "@/shared/lib/infra/logger";
import { loginSchema } from "./validations/auth";
import { throttleKeys, isLoginThrottled, recordLoginFailure, resetLoginFailures } from "./throttle";
import { applyAuthorizationSnapshot, loadAuthorizationSnapshot } from "./revalidate";
import { passwordHashFor, DUMMY_PASSWORD_HASH } from "./password-select";

export type OAuthProviderId = "google" | "microsoft";

/** ปุ่ม OAuth โผล่เฉพาะเมื่อ env ครบ — ไม่ลงทะเบียน provider ที่ไม่มี credential */
export function oauthProviderIds(): OAuthProviderId[] {
  const ids: OAuthProviderId[] = [];
  if (googleOAuthConfigured()) ids.push("google");
  if (microsoftOAuthConfigured()) ids.push("microsoft");
  return ids;
}

export type GoogleAccountInfo = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
};

export async function getAvailableGoogleAccounts(): Promise<GoogleAccountInfo[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: "@gmail.com" } },
        { googleEmail: { not: null } },
        { provider: "google" },
      ],
      isActive: true,
      allowGoogleLogin: true,
    },
    select: { id: true, name: true, email: true, googleEmail: true, imageUrl: true },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.googleEmail || u.email,
    imageUrl: u.imageUrl,
  }));
}

function clientIp(req: Request | undefined): string | null {
  const xff = req?.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : null;
}

/** ผู้ใช้ต้องมีสมาชิกภาพ active ใน tenant เดียว (single tenant) — คืน tenantId */
async function homeTenantId(userId: string): Promise<string | null> {
  const ut = await prisma.userTenant.findFirst({ where: { userId, isActive: true }, orderBy: { joinedAt: "asc" }, select: { tenantId: true } });
  return ut?.tenantId ?? null;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 2 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  providers: [
    ...(googleOAuthConfigured()
      ? [
          Google({
            clientId: env().GOOGLE_CLIENT_ID,
            clientSecret: env().GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile",
              },
            },
            checks: ["pkce", "state"],
          }),
        ]
      : []),
    ...(microsoftOAuthConfigured()
      ? [MicrosoftEntraID({ clientId: env().MICROSOFT_CLIENT_ID, clientSecret: env().MICROSOFT_CLIENT_SECRET, issuer: `https://login.microsoftonline.com/${env().MICROSOFT_TENANT_ID}/v2.0` })]
      : []),
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const keys = throttleKeys(email, clientIp(request));

        if (await isLoginThrottled(keys)) {
          logger.warn("login throttled", { email });
          return null;
        }
        const targetEmail = email.includes("@") ? email : `${email}@app.local`;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { email: targetEmail },
            ],
          },
        });
        const passwordOk = await verifyPassword(password, passwordHashFor(user, DUMMY_PASSWORD_HASH));
        if (!user || !user.passwordHash || !user.isActive || !passwordOk) {
          await recordLoginFailure(keys);
          return null;
        }
        await resetLoginFailures(keys);
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, email: user.email, name: user.name, image: user.imageUrl ?? undefined };
      },
    }),
    Credentials({
      id: "google-dev",
      name: "Google Direct",
      credentials: { email: { type: "email" } },
      async authorize(credentials) {
        const rawEmail = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        if (!rawEmail) return null;
        const email = rawEmail.includes("@") ? rawEmail : `${rawEmail}@gmail.com`;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { googleEmail: email },
            ],
            isActive: true,
          },
        });

        // ไม่อนุญาตให้สร้างใหม่อัตโนมัติ และตรวจสอบ allowGoogleLogin
        if (!user || !user.allowGoogleLogin) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: "google",
            providerId: user.providerId ?? `gdev_${user.id}`,
            googleEmail: user.googleEmail ?? email,
            lastLoginAt: new Date(),
          },
        });
        return { id: user.id, email: user.email, name: user.name, image: user.imageUrl ?? undefined };
      },
    }),
  ],
  callbacks: {
    /** OAuth: ตรวจสอบผู้ใช้จากอีเมล Google กับฐานข้อมูล — ห้ามสร้างบัญชีใหม่อัตโนมัติ */
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials" || account.provider === "google-dev") return true;
      const providerKey: OAuthProviderId = account.provider === "microsoft-entra-id" ? "microsoft" : "google";
      const email = user.email?.trim().toLowerCase();
      if (!email) return "/login?error=NoAccount";

      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { googleEmail: email },
          ],
        },
      });

      if (!existing || !existing.isActive) return "/login?error=NoAccount";
      if (providerKey === "google" && !existing.allowGoogleLogin) return "/login?error=GoogleDisabled";

      // จัดเก็บเฉพาะข้อมูลที่จำเป็น และไม่จัดเก็บ Google access token
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          provider: providerKey,
          providerId: account.providerAccountId,
          googleEmail: existing.googleEmail ?? email,
          imageUrl: user.image ?? existing.imageUrl,
          lastLoginAt: new Date(),
        },
      });
      user.id = existing.id;
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      try {
        const parsed = new URL(url);
        if (parsed.hostname === "0.0.0.0" || parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        if (parsed.origin === baseUrl) return url;
        return url;
      } catch {
        return "/";
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.userId = user.id;
        token.tenantId = (await homeTenantId(user.id)) ?? undefined;
        token.checkedAt = 0; // บังคับโหลด snapshot ทันทีด้านล่าง
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
        token.checkedAt = 0; // เช่น เปลี่ยนรหัสผ่านแล้ว mustChangePassword ต้องหายทันที
      }
      // edge runtime ไม่มี Prisma — proxy.ts อ่าน token ที่ฝั่ง node เขียนไว้แล้วเท่านั้น
      // เงื่อนไขเวลา/การเขียน token ทั้งหมดอยู่ใน applyAuthorizationSnapshot (มีเทสต์ใน revalidate.int.test.ts)
      if (process.env.NEXT_RUNTIME === "edge") return token;
      return applyAuthorizationSnapshot(token, loadAuthorizationSnapshot);
    },

    async session({ session, token }) {
      if (token.invalid || !token.userId || !token.tenantId) {
        session.user.id = "";
        session.tenantId = "";
        session.roles = []; session.permissions = []; session.isSuperAdmin = false; session.mustChangePassword = false; session.locale = null;
        return session;
      }
      session.user.id = token.userId;
      session.user.name = (token.name as string) ?? session.user.name;
      session.user.image = (token.picture as string) ?? undefined;
      session.tenantId = token.tenantId;
      session.locale = token.locale ?? null;
      session.roles = token.roles ?? [];
      session.permissions = token.permissions ?? [];
      session.isSuperAdmin = token.isSuperAdmin ?? false;
      session.mustChangePassword = token.mustChangePassword ?? false;
      return session;
    },
  },
});
