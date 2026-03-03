"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCbQuerySchema = void 0;
const zod_1 = require("zod");
exports.computeCbQuerySchema = zod_1.z.object({
    shipId: zod_1.z.string().min(1, 'shipId is required'),
    year: zod_1.z.coerce.number().int().min(2025, 'Year must be >= 2025'),
});
