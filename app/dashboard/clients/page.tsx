"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  createdAt: string;
};

const statusStyles: Record<Client["status"], string> = {
  LEAD: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-200 text-gray-600",
};

const statusLabels: Record<Client["status"], string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("LEAD");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompany("");
    setStatus("LEAD");
    setEditingId(null);
  };

  const loadData = async () => {
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setError("Failed to load clients");
        return;
      }
      const data = await res.json();
      const sorted = [...data].sort(
        (a: Client, b: Client) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setClients(sorted);
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        editingId ? `/api/clients/${editingId}` : "/api/clients",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, company, status }),
        },
      );
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
      if (editingId) {
        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? data : c)),
        );
      } else {
        await loadData();
      }
      resetForm();
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Client) => {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email);
    setCompany(c.company);
    setStatus(c.status);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client and all of their projects and tasks?"))
      return;
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        if (editingId === id) resetForm();
      } else {
        setError("Could not delete client");
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
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="mt-1 text-muted-foreground">
          The people and companies you work for
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="glass w-full border-0 lg:max-w-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit client" : "New client"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  required
                  className="neu-inset"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Khan"
                />
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  className="neu-inset"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@khantextiles.com"
                />
              </div>

              <div className="space-y-1">
                <Label>Company</Label>
                <Input
                  required
                  className="neu-inset"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Khan Textiles"
                />
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="neu-inset w-full rounded-md px-3 py-2 text-sm"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-skeuo flex-1 cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add client"}
                </Button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="neu-raised cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="w-full space-y-3">
          {loadingList ? null : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clients yet.</p>
          ) : (
            clients.map((c) => (
              <Card key={c.id} className="glass border-0">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words font-semibold">{c.name}</p>
                    <p className="break-words text-sm text-muted-foreground">
                      {c.email}
                    </p>
                    <p className="break-words text-sm">{c.company}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[c.status]}`}
                    >
                      {statusLabels[c.status]}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="neu-raised cursor-pointer rounded-md p-2"
                        aria-label="Edit client"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="neu-raised cursor-pointer rounded-md p-2 text-red-500"
                        aria-label="Delete client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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