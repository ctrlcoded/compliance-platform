import api from './api';
import { Pool, StandardResponse } from '../types';

export const poolsService = {
    // Create a new pool
    createPool: async (year: number, shipIds: string[]) => {
        const { data } = await api.post<StandardResponse<Pool>>('/pools', {
            year, shipIds
        });
        return data;
    },

    // Get pool details
    getPool: async (poolId: string) => {
        const { data } = await api.get<StandardResponse<Pool>>(`/pools/${poolId}`);
        return data;
    },

    // Join an existing pool
    joinPool: async (poolId: string, shipId: string) => {
        const { data } = await api.post<StandardResponse<Pool>>(`/pools/${poolId}/join`, {
            shipId
        });
        return data;
    },

    // Leave a pool
    leavePool: async (poolId: string, shipId: string) => {
        const { data } = await api.post<StandardResponse<Pool>>(`/pools/${poolId}/leave`, {
            shipId
        });
        return data;
    }
};
