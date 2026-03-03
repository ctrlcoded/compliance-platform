"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareRoutesQuerySchema = exports.baselineRouteParamSchema = exports.getRoutesQuerySchema = void 0;
const zod_1 = require("zod");
const CommonDTO_1 = require("./CommonDTO");
exports.getRoutesQuerySchema = zod_1.z.object({
    vesselType: zod_1.z.string().optional(),
    fuelType: zod_1.z.string().optional(),
    year: zod_1.z.coerce.number().int().min(2025).optional(),
}).merge(CommonDTO_1.paginationSchema);
exports.baselineRouteParamSchema = zod_1.z.object({
    routeId: zod_1.z.string().min(1, 'routeId is required'),
});
exports.compareRoutesQuerySchema = zod_1.z.object({
    shipId: zod_1.z.string().min(1, 'shipId is required'),
    year: zod_1.z.coerce.number().int().min(2025, 'Year must be >= 2025'),
});
