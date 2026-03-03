import { z } from 'zod';

export const computeCbQuerySchema = z.object({
    shipId: z.string().min(1, 'shipId is required'),
    year: z.coerce.number().int().min(2025, 'Year must be >= 2025'),
});

export type ComputeCbQueryDto = z.infer<typeof computeCbQuerySchema>;
