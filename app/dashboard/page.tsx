"use client";
import AddClientForm, { UpdateClientForm } from "@/components/ClientForm";
import { signOut } from "next-auth/react";
import { NextResponse } from "next/server";
import { useState } from "react";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
};

const statusStyles: Record<Client["status"], string> = {
  LEAD: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-200 text-gray-600",
};

const DashboardPage = () => {
  const [logOut, setLogOut] = useState("LogOut");
  const [seeClients, setSeeClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [deletingClient, setdeletingClient] = useState(false);
  const [updatingClient, setUpdatingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleSubmit = async () => {
    setLogOut("Loging Out");
    await signOut({ callbackUrl: "/signin" });
  };

  const handleClients = async () => {
    setLoadingClients(true);
    const res = await fetch("/api/clients", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const clients = await res.json();
    setSeeClients(clients);
    setdeletingClient(false);
  };
  const handleUpdate = async (req: Client) => {
    setUpdatingClient(true);

    handleClients();
  };
  const handleDelete = async (req: String) => {
    setdeletingClient(true);
    const id = req;
    const res = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      return NextResponse.json(
        { message: "Client deleted successfully" },
        { status: 200 },
      );
    }
    seeClients.filter((prev) => {
      prev.id === id;
    });
    handleClients();
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="flex items-center justify-between border-b bg-black px-6 py-4">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>

        <button
          className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          onClick={handleSubmit}
        >
          {logOut}
        </button>
      </nav>

      <section className="p-8">
        <div className="rounded-lg bg-blue-300 p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Welcome Back</h2>
            <button
              className="rounded bg-yellow-500 px-8 py-2 text-white transition hover:bg-yellow-600 disabled:opacity-50"
              onClick={handleClients}
              disabled={loadingClients}
            >
              {loadingClients ? "Loading..." : "See Clients"}
            </button>
          </div>

          <p className="text-gray-700">You have successfully signed in.</p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <AddClientForm onClientAdded={handleClients} />

          <div className="w-full space-y-3">
            {seeClients.length === 0 ? (
              <p className="text-sm text-gray-500">
                No clients loaded yet click "See Clients" to fetch them.
              </p>
            ) : (
              seeClients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.email}</p>
                    {c.company && (
                      <p className="text-sm text-gray-400">{c.company}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[c.status]}`}
                  >
                    {c.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedClient(c);
                      setUpdatingClient(true);
                    }}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update
                  </button>
                  {selectedClient && updatingClient && (
                    <UpdateClientForm
                      client={selectedClient}
                      onCancel={() => {
                        setUpdatingClient(false);
                        setSelectedClient(null);
                      }}
                      onClientUpdated={handleClients}
                    />
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
