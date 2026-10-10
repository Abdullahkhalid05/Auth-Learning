import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, FolderOpen, CheckSquare, Activity } from "lucide-react";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) return null;
  const userId = session.user.id;

  const [clientCount, projectCount, activeProjectCount, taskCount] =
    await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "ACTIVE" } }),
      prisma.task.count({ where: { project: { userId } } }),
    ]);

  const stats = [
    {
      label: "Clients",
      value: clientCount,
      icon: Users,
      description: "People and companies you work for",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      href: "/dashboard/clients",
    },
    {
      label: "Projects",
      value: projectCount,
      icon: FolderOpen,
      description: "All projects",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      href: "/dashboard/projects",
    },
    {
      label: "Active projects",
      value: activeProjectCount,
      icon: Activity,
      description: "Currently in progress",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/dashboard/projects",
    },
    {
      label: "Tasks",
      value: taskCount,
      icon: CheckSquare,
      description: "Across all your projects",
      color: "text-green-500",
      bg: "bg-green-500/10",
      href: "/dashboard/tasks",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          A summary of your work
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="glass border-0 transition-transform hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="neu-raised rounded-md p-2">
                  <stat.icon size={16} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>  
  );
}