import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  return (
    <div className="flex h-screen gap-3 p-3">
      <Sidebar />
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <header className="glass px-6 py-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Welcome back, {session?.user?.name ?? session?.user?.email}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
