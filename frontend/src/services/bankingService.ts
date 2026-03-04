import api from './api';
import { BankEntry, StandardResponse } from '../types';

export const bankingService = {
    // Bank surplus compliance balance
    bankSurplus: async (shipId: string, year: number, amount: number) => {
        const { data } = await api.post<StandardResponse<BankEntry>>('/banking/bank', {
            shipId, year, amount
        });
        return data;
    },

    // Apply banked balance to current year deficit
    applyBanked: async (shipId: string, year: number, amount: number) => {
        const { data } = await api.post<StandardResponse<BankEntry>>('/banking/apply', {
            shipId, year, amount
        });
        return data;
    },

    // Get full banking ledger history
    getLedger: async (shipId: string, year: number = 2025) => {
        const { data } = await api.get<StandardResponse<BankEntry[]>>('/banking/records', {
            params: { shipId, year }
        });
        return data;
    }
};
