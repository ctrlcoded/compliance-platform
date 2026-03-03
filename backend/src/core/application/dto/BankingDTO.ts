import { z } from 'zod';
import { paginationSchema } from './CommonDTO';

export const getLedgerQuerySchema = z.object({
    shipId: z.string().min(1, 'shipId is required'),
    year: z.coerce.number().int().min(2025, 'Year must be >= 2025'),
}).merge(paginationSchema);

export type GetLedgerQueryDto = z.infer<typeof getLedgerQuerySchema>;

const baseBankOperationSchema = z.object({
    shipId: z.string().min(1, 'shipId is required'),
    year: z.coerce.number().int().min(2025, 'Year must be >= 2025'),
    amount: z.number().positive('amount must be greater than 0'),
});

export const bankSurplusBodySchema = baseBankOperationSchema;
export type BankSurplusBodyDto = z.infer<typeof bankSurplusBodySchema>;

export const applyBankedBodySchema = baseBankOperationSchema;
export type ApplyBankedBodyDto = z.infer<typeof applyBankedBodySchema>;
