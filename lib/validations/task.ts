import z from "zod";

export const taskScheme = z.object({
    title: z.string().min(1),
    status : z.enum(["TODO" ,"IN_PROGRESS","DONE"]),
    projectId :z.string().min(1)
})