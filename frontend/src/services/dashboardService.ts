import api from './api';
import { DashboardData, StandardResponse } from '../types';

export const dashboardService = {
    // Fetch Adjusted Compliance Balance for the Dashboard Overview
    getAdjustedCb: async (shipId: string, year: number) => {
        const { data } = await api.get<StandardResponse<DashboardData>>('/compliance/adjusted-cb', {
            params: { shipId, year }
        });
        return data;
    }
};
