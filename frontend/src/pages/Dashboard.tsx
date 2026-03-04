import { useEffect, useState } from 'react';
import { dashboardService } from '../services';
import { DashboardData } from '../types';

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                // Using seeded ship data for demo
                const response = await dashboardService.getAdjustedCb('IMO-1111111', 2025);
                setData(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Summary</h1>

            {loading && <p>Loading summary...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Initial Compliance Balance</h3>
                        <p className="text-3xl font-semibold text-gray-900">{data.cbBefore}</p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Banked / Applied</h3>
                        <p className="text-3xl font-semibold text-blue-600">{data.bankApplied}</p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Final Adjusted Balance</h3>
                        <p className={`text-3xl font-semibold ${data.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.cbAfter}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
