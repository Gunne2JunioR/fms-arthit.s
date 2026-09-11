import { requireSession, getProfile } from "@/features/identity/server";
import { ProfileForm } from "./_components/profile-form";

export default async function MePage() {
  const ctx = await requireSession();
  const profile = await getProfile(ctx.userId);
  return (
    <ProfileForm
      initial={{
        name: profile.name,
        locale: (profile.locale as "th" | "en") ?? "th",
        email: profile.email,
        imageUrl: profile.imageUrl ?? "",
      }}
    />
  );
}
