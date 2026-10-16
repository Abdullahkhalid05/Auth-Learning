"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Client = { id: string; name: string };

type Project = {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED";
  budget: number;
  clientId: string;
  client: { name: string };
};

const statusStyles: Record<Project["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<Project["status"], string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [budget, setBudget] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectReq, clientReq] = await Promise.all([
        fetch("/api/projects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/clients", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!projectReq.ok || !clientReq.ok) {
        setError("Failed to load data");
        return;
      }

      const projectsData = await projectReq.json();
      const clientsData = await clientReq.json();
      setProjects(projectsData);
      setClients(clientsData);
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          budget: Number(budget),
          clientId,
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
      setProjects((prev) => [data.project, ...prev]);
      setTitle("");
      setBudget("");
      setDescription("");
      setStatus("ACTIVE");
      setClientId("");
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and its tasks?")) return;
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError("Could not delete project");
      }
    } catch (err) {
      setError("Failed to reach server");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-muted-foreground">
          Track the work you do for each client
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="glass w-full border-0 lg:max-w-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">New project</h2>

            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                A project belongs to a client.{" "}
                <Link href="/dashboard/clients" className="underline">
                  Add a client first
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
                    placeholder="Website redesign"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input
                    required
                    className="neu-inset"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Redesign the homepage"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Client</Label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="neu-inset w-full rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="neu-inset w-full rounded-md px-3 py-2 text-sm"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On hold</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label>Budget</Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      className="neu-inset"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="1500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-skeuo cursor-pointer w-full"
                >
                  {loading ? "Adding..." : "Add project"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="w-full space-y-3">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            projects.map((p) => (
              <Card key={p.id} className="glass border-0">
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-1">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-muted-foreground">
                      for {p.client.name}
                    </p>
                    <p className="text-sm">{p.description}</p>
                    <p className="text-sm font-medium">
                      ${p.budget.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[p.status]}`}
                    >
                      {statusLabels[p.status]}
                    </span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="neu-raised cursor-pointer rounded-md p-2 text-red-500"
                      aria-label="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
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