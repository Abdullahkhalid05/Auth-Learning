import z from "zod";
export const projectSchema = z.object({
    title : z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED"]),
    budget: z.number().min(0),
    clientId : z.string().min(1)
})