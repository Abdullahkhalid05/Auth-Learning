import { describe, it, expect, vi, beforeEach } from "vitest";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prism";
import { POST } from "@/app/api/clients/route";

vi.mock("next-auth" , ()=>({
    getServerSession: vi.fn()
}))
vi.mock("@/lib/prism",()=>({
    prisma:{
        client:{
           create: vi.fn()
        }
    }
}))
describe("POST /api/client",()=>{
    beforeEach(()=>{
        vi.clearAllMocks()
    })
    it("should create a client successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-123",
      },
    } as any);

    vi.mocked(prisma.client.create).mockResolvedValue({
      id: "client-1",
      name: "John",
      email: "john@example.com",
      company: "Acme",
      status: "lead",
      userId: "user-123",
    } as any);

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "john@example.com",
        company: "Acme",
        status: "lead",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    expect(prisma.client.create).toHaveBeenCalled();
  });
});