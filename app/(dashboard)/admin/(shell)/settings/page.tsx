import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const email = session?.user?.email;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">Your admin account.</p>

      <section className="mt-8 rounded-[10px] border border-line bg-surface p-6 md:p-7">
        <h2 className="text-lg">Account</h2>
        <p className="mono mt-1 text-sm text-muted">{email}</p>

        <hr className="my-6 border-line" />

        <h2 className="text-lg">Change password</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          You&apos;ll need your current password. Sessions last 7 days.
        </p>
        <ChangePasswordForm email={email} />
      </section>
    </div>
  );
}
