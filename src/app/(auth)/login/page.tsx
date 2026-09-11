import { oauthProviderIds, googleOAuthConfigured, getAvailableGoogleAccounts } from "@/features/identity/server";
import { LoginPanel } from "./_components/login-panel";

export default async function LoginPage() {
  const [providers, googleConfigured, googleAccounts] = await Promise.all([
    Promise.resolve(oauthProviderIds()),
    Promise.resolve(googleOAuthConfigured()),
    getAvailableGoogleAccounts().catch(() => []),
  ]);

  return (
    <LoginPanel
      providers={providers}
      googleConfigured={googleConfigured}
      googleAccounts={googleAccounts}
    />
  );
}
