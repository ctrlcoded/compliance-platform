import { z } from 'zod';

export const createPoolBodySchema = z.object({
    year: z.coerce.number().int().min(2025, 'Year must be >= 2025'),
    shipIds: z.array(z.string().min(1)).min(2, 'At least 2 ships are required for a pool'),
});

export type CreatePoolBodyDto = z.infer<typeof createPoolBodySchema>;

export const getPoolParamSchema = z.object({
    poolId: z.string().uuid('poolId must be a valid UUID'),
});
