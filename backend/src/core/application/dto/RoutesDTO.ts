import { z } from 'zod';
import { paginationSchema } from './CommonDTO';

export const getRoutesQuerySchema = z.object({
    vesselType: z.string().optional(),
    fuelType: z.string().optional(),
    year: z.coerce.number().int().min(2025).optional(),
}).merge(paginationSchema);

export type GetRoutesQueryDto = z.infer<typeof getRoutesQuerySchema>;

export const baselineRouteParamSchema = z.object({
    routeId: z.string().min(1, 'routeId is required'),
});

export const compareRoutesQuerySchema = z.object({
    shipId: z.string().min(1, 'shipId is required'),
    year: z.coerce.number().int().min(2025, 'Year must be >= 2025'),
});

export type CompareRoutesQueryDto = z.infer<typeof compareRoutesQuerySchema>;
