"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolParamSchema = exports.createPoolBodySchema = void 0;
const zod_1 = require("zod");
exports.createPoolBodySchema = zod_1.z.object({
    year: zod_1.z.coerce.number().int().min(2025, 'Year must be >= 2025'),
    shipIds: zod_1.z.array(zod_1.z.string().min(1)).min(2, 'At least 2 ships are required for a pool'),
});
exports.getPoolParamSchema = zod_1.z.object({
    poolId: zod_1.z.string().uuid('poolId must be a valid UUID'),
});
