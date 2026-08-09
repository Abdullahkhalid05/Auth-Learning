"use client";

import { useState } from "react";

const AddClientForm = ({ onClientAdded }: { onClientAdded?: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("LEAD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors).flat();
          setError(messages.join(", ") || "Invalid input");
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      setName("");
      setEmail("");
      setCompany("");
      setStatus("LEAD");
      onClientAdded?.();
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Add Client</h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <label className="mb-1 block text-sm text-gray-800">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded text-gray-900 border border-gray-300 p-2 text-sm"
          placeholder="Sarah Khan"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-800">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-gray-900 rounded border border-gray-300 p-2 text-sm"
          placeholder="sarah@khantextiles.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-800">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded  border bg-amber-200 text-black border-gray-300 p-2 text-sm"
          placeholder="Khan Textiles"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-800">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border text-gray-950 bg-amber-200 border-gray-800 p-2 text-sm"
        >
          <option value="LEAD" className="text-gray-950">
            Lead
          </option>
          <option value="ACTIVE" className="text-gray-950">
            Active
          </option>
          <option value="INACTIVE" className="text-gray-950">
            Inactive
          </option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-gray-900 p-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Client"}
      </button>
    </form>
  );
};

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
};

type UpdateClientFormProps = {
  onCancel?: () => void;
  onClientUpdated?: () => void;
  client: Client;
};

const UpdateClientForm = ({
  onCancel,
  client,
  onClientUpdated,
}: UpdateClientFormProps) => {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [company, setCompany] = useState(client.company);
  const [status, setStatus] = useState(client.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company,
          status,
        }),
      });
      
      const data = await res.json();
      
      if (!data) {
        if (data.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors).flat();
          setError(messages.join(", ") || "Invalid input");
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }
      onClientUpdated?.();
      onCancel?.();
    } catch (err) {
      setError("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Update Client</h2>

        <input
          type="text"
          placeholder="Name"
          className="mb-3 w-full text-amber-700 rounded border p-2"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full text-amber-700 rounded border p-2"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <input
          type="text"
          placeholder="Company"
          className="mb-3 w-full text-amber-700 rounded border p-2"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
          }}
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "LEAD" | "ACTIVE" | "INACTIVE")
          }
          className="mb-4 w-full rounded border p-2 text-amber-700"
        >
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="flex justify-end gap-2">
          <button className="rounded bg-gray-800 px-4 py-2" onClick={onCancel}>
            Cancel
          </button>

          <button
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={handleUpdate}
          >
            {loading ? "Updating..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export { UpdateClientForm };
export default AddClientForm;
