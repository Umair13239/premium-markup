import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-dvh bg-paper">
      <AdminSidebar email={session?.user?.email} signOutAction={doSignOut} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
