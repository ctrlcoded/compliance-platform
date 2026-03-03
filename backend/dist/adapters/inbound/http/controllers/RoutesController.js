"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesController = void 0;
const RoutesDTO_1 = require("../../../../core/application/dto/RoutesDTO");
// Given the architectural setup, I am stubbing the Use Cases here.
// In a full implementation, these would be injected instances executing domain logic.
class RoutesController {
    async getRoutes(req, res) {
        const query = RoutesDTO_1.getRoutesQuerySchema.parse(req.query);
        // Stub functionality to return 200 with data
        res.status(200).json({
            data: [
                {
                    routeId: "R001",
                    shipId: "S1",
                    vesselType: "Container",
                    fuelType: "HFO",
                    year: query.year || 2025,
                    ghgIntensity: 91.0,
                    fuelConsumptionTonnes: 5000,
                    distanceKm: 12000,
                    totalEmissionsTonnes: 4500,
                    isBaseline: true
                }
            ],
            pagination: {
                page: query.page,
                limit: query.limit,
                total: 1
            }
        });
    }
    async setBaseline(req, res) {
        const params = RoutesDTO_1.baselineRouteParamSchema.parse(req.params);
        res.status(200).json({
            data: {
                routeId: params.routeId,
                isBaseline: true
            }
        });
    }
    async getComparison(req, res) {
        const query = RoutesDTO_1.compareRoutesQuerySchema.parse(req.query);
        res.status(200).json({
            data: {
                target: 89.3368,
                baseline: {
                    routeId: "R001",
                    ghgIntensity: 91.0
                },
                comparisons: [
                    {
                        routeId: "R002",
                        ghgIntensity: 88.0,
                        percentDiff: -3.29,
                        compliant: true
                    }
                ]
            }
        });
    }
}
exports.RoutesController = RoutesController;
