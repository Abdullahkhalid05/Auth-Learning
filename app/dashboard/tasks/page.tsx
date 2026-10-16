"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Project = { id: string; title: string };

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  project: { title: string };
};

const statusStyles: Record<Task["status"], string> = {
  TODO: "bg-gray-200 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const statusLabels: Record<Task["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("TODO");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const loadData = async () => {
    setError("");
    try{
        const [taskReq, projectReq] = await Promise.all([
        fetch("/api/tasks" , {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/projects" , {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }),

        ])
        if (!taskReq.ok || !projectReq.ok) {
            setError("Failed to load data");
            return;
          }
        const project =await projectReq.json()
        const task =await taskReq.json()
        setTasks(task)  
        setProjects(project)  

    }catch(err){
         setError("Failed to reach server");
    }finally{
         setLoadingList(false);
    }
  };


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          status,
          projectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors).flat();
          setError(messages.join(", ") || "Invalid input");
        } else {
          setError(data.error || data.message || "Something went wrong");
        }
        return;
      }
      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      setProjectId("")
      setStatus("ACTIVE");
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="mt-1 text-muted-foreground">
          Break each project into steps and track their progress
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="glass w-full border-0 lg:max-w-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">New task</h2>

            {loadingList ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                A task belongs to a project.{" "}
                <Link href="/dashboard/projects" className="underline">
                  Add a project first
                </Link>
                .
              </p>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    required
                    className="neu-inset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Design the homepage mockup"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Project</Label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="neu-inset w-full rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select a project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="neu-inset w-full rounded-md px-3 py-2 text-sm"
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-skeuo w-full cursor-pointer"
                >
                  {loading ? "Adding..." : "Add task"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="w-full space-y-3">
          {loadingList ? null : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            tasks.map((t) => (
              <Card key={t.id} className="glass border-0">
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-1">
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      in {t.project.title}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[t.status]}`}
                    >
                      {statusLabels[t.status]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}