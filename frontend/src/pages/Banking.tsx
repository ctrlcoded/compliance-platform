import { useEffect, useState, useCallback } from 'react';
import { bankingService, dashboardService } from '../services';
import { BankEntry, DashboardData } from '../types';

export default function Banking() {
    const [entries, setEntries] = useState<BankEntry[]>([]);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [amount, setAmount] = useState<number | ''>('');
    const [actionLoading, setActionLoading] = useState(false);

    const year = 2025; // Hardcoded for demo
    const shipId = 'IMO-1111111'; // Hardcoded for demo

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ledgerRes, cbRes] = await Promise.all([
                bankingService.getLedger(shipId, year),
                dashboardService.getAdjustedCb(shipId, year)
            ]);
            setEntries(ledgerRes.data);
            setDashboard(cbRes.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch banking data');
        } finally {
            setLoading(false);
        }
    }, [shipId, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (action: 'bank' | 'apply') => {
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        try {
            setActionLoading(true);
            if (action === 'bank') {
                await bankingService.bankSurplus(shipId, year, Number(amount));
            } else {
                await bankingService.applyBanked(shipId, year, Number(amount));
            }
            setAmount('');
            fetchData(); // Refresh the ledger and CB
        } catch (err: any) {
            alert(err.message || `Failed to ${action}`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Banking Ledger & Allocation</h1>

            {error && <p className="text-red-500 mb-4">Error: {error}</p>}

            {!loading && !error && dashboard && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Compliance Balance Summary */}
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Compliance Balance (CB)</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Unadjusted CB (Before Banking/Pooling):</span>
                                <span className="font-medium text-gray-900">{dashboard.cbBefore}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Net Banked/Applied:</span>
                                <span className="font-medium text-blue-600">{dashboard.bankApplied}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Final Adjusted CB:</span>
                                <span className={`text-lg font-bold ${dashboard.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {dashboard.cbAfter}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Banking Action Form */}
                    <div className="bg-white border rounded-lg p-6 shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Compliance (Article 20)</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            You may voluntarily bank surplus compliance balance for the following year, or apply previously banked surplus to cover a current deficit.
                        </p>
                        <div className="flex space-x-4 mb-4">
                            <input
                                type="number"
                                className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                                placeholder="Enter amount..."
                                value={amount}
                                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                min="1"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleAction('bank')}
                                disabled={actionLoading || dashboard.cbAfter <= 0}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-white 
                                    ${dashboard.cbAfter > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {actionLoading ? 'Processing...' : 'Bank Surplus'}
                            </button>
                            <button
                                onClick={() => handleAction('apply')}
                                disabled={actionLoading || dashboard.cbAfter >= 0}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-white 
                                    ${dashboard.cbAfter < 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {actionLoading ? 'Processing...' : 'Apply Banked'}
                            </button>
                        </div>
                        {dashboard.cbAfter <= 0 && (
                            <p className="text-xs text-red-500 mt-2 text-center">Cannot bank surplus when balance is negative or zero.</p>
                        )}
                        {dashboard.cbAfter > 0 && (
                            <p className="text-xs text-green-600 mt-2 text-center">Cannot apply banked credits when already compliant.</p>
                        )}
                    </div>
                </div>
            )}

            <h3 className="text-lg font-medium text-gray-900 mb-4">Historical Ledger</h3>
            {loading ? (
                <p>Loading ledger...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No banking entries found.</td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.shipId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${entry.type === 'APPLY' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
