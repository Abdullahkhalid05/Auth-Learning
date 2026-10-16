import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Users, FolderOpen, CheckSquare } from "lucide-react";
import { authConfig } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    color: "text-violet-500",
    title: "Clients",
    text: "Keep every client in one place, with their company and where they stand, from lead to active.",
  },
  {
    icon: FolderOpen,
    color: "text-orange-500",
    title: "Projects",
    text: "Attach projects to a client, set a budget, and track whether each one is active, on hold, or done.",
  },
  {
    icon: CheckSquare,
    color: "text-green-500",
    title: "Tasks",
    text: "Break a project into tasks and move them from to do to done as the work gets finished.",
  },
];

export default async function Home() {
  const session = await getServerSession(authConfig);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass mx-4 mt-4 flex items-center justify-between self-center px-6 py-3 sm:w-full sm:max-w-5xl">
        <span className="text-lg font-bold">Client Dashboard</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/signin"
            className="cursor-pointer text-sm font-medium hover:underline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-skeuo cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4">
        <section className="mx-auto max-w-3xl py-24 text-center">
          <span className="glass inline-block px-4 py-1 text-xs font-medium text-muted-foreground">
            Built for freelancers
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Manage your clients, projects, and tasks in one place
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A simple private workspace where every client, project, and task is
            yours alone. Sign up, add a client, and start tracking the work.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn-skeuo cursor-pointer rounded-md px-8 py-3 font-medium"
            >
              Create an account
            </Link>
            <Link
              href="/signin"
              className="neu-raised cursor-pointer rounded-md px-8 py-3 font-medium"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="glass border-0">
              <CardContent className="space-y-3 p-6">
                <div className="neu-raised inline-flex rounded-md p-3">
                  <f.icon size={20} className={f.color} />
                </div>
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        Built with Next.js, Prisma, and NextAuth
      </footer>
    </div>
  );
}