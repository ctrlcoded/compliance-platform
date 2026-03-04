import api from './api';
import { Route, Comparison, PaginatedResponse, StandardResponse } from '../types';

export const routesService = {
    // Get all routes for a specific ship and year, with optional filters
    getRoutes: async (shipId: string, year: number, vesselType?: string, fuelType?: string, page = 1, limit = 10) => {
        const params: any = { shipId, year, page, limit };
        if (vesselType) params.vesselType = vesselType;
        if (fuelType) params.fuelType = fuelType;

        const { data } = await api.get<PaginatedResponse<Route>>('/routes', { params });
        return data;
    },

    // Create a new route
    createRoute: async (routeData: {
        shipId: string;
        vesselType: string;
        fuelType: string;
        year: number;
        fuelConsumptionTonnes: number;
        distanceKm: number;
    }) => {
        const { data } = await api.post<StandardResponse<Route>>('/routes', routeData);
        return data;
    },

    // Set a route as the baseline for comparison
    setBaseline: async (routeId: string) => {
        const { data } = await api.post<StandardResponse<{ routeId: string, isBaseline: boolean }>>(`/routes/${routeId}/baseline`);
        return data;
    },

    // Compare routes against the baseline
    getComparison: async (shipId: string, year: number) => {
        const { data } = await api.get<StandardResponse<Comparison>>('/routes/comparison', {
            params: { shipId, year }
        });
        return data;
    },

    // Delete a route
    deleteRoute: async (id: string) => {
        await api.delete(`/routes/${id}`);
        return true;
    }
};
