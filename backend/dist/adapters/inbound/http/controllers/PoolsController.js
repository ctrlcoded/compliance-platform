"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolsController = void 0;
const PoolsDTO_1 = require("../../../../core/application/dto/PoolsDTO");
class PoolsController {
    async createPool(req, res) {
        const body = PoolsDTO_1.createPoolBodySchema.parse(req.body);
        res.status(201).json({
            data: {
                poolId: "P123",
                year: body.year,
                members: body.shipIds.map((shipId, idx) => ({
                    shipId,
                    cbBefore: idx === 0 ? 5000000 : -3000000, // Dummy initial breakdown
                    cbAfter: idx === 0 ? 2000000 : 0 // Dummy allocation outcome
                }))
            }
        });
    }
    async getPool(req, res) {
        const params = PoolsDTO_1.getPoolParamSchema.parse(req.params);
        res.status(200).json({
            data: {
                poolId: params.poolId,
                year: 2025,
                members: [
                    {
                        shipId: "S1",
                        cbBefore: 5000000,
                        cbAfter: 2000000
                    },
                    {
                        shipId: "S2",
                        cbBefore: -3000000,
                        cbAfter: 0
                    }
                ]
            }
        });
    }
}
exports.PoolsController = PoolsController;
