import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-navy-900">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-navy-50 lg:rounded-tl-3xl">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
