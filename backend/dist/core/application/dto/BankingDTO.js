"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBankedBodySchema = exports.bankSurplusBodySchema = exports.getLedgerQuerySchema = void 0;
const zod_1 = require("zod");
const CommonDTO_1 = require("./CommonDTO");
exports.getLedgerQuerySchema = zod_1.z.object({
    shipId: zod_1.z.string().min(1, 'shipId is required'),
    year: zod_1.z.coerce.number().int().min(2025, 'Year must be >= 2025'),
}).merge(CommonDTO_1.paginationSchema);
const baseBankOperationSchema = zod_1.z.object({
    shipId: zod_1.z.string().min(1, 'shipId is required'),
    year: zod_1.z.coerce.number().int().min(2025, 'Year must be >= 2025'),
    amount: zod_1.z.number().positive('amount must be greater than 0'),
});
exports.bankSurplusBodySchema = baseBankOperationSchema;
exports.applyBankedBodySchema = baseBankOperationSchema;
