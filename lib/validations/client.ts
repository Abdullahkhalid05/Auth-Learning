import { z} from 'zod'

export const clientSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().min(1),
    status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]),
})