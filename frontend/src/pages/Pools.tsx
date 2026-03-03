import { useEffect, useState } from 'react';
import { poolsService } from '../services';
import { Pool } from '../types';

export default function Pools() {
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPool = async () => {
            try {
                setLoading(true);
                // Using dummy pool ID 'P123' for prototype scaffolding as there is no list endpoint yet
                const response = await poolsService.getPool('P123');
                setPool(response.data);
            } catch (err: any) {
                // Suppress 404 for prototype if pool doesn't exist yet, show as empty
                if (err?.response?.status === 404) {
                    setPool(null);
                } else {
                    setError(err.message || 'Failed to fetch pool data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPool();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pools</h1>

            {loading && <p>Loading pool data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <div className="mb-6">
                    {pool ? (
                        <div className="mb-4 text-sm text-gray-700">
                            <p><strong>Pool ID:</strong> {pool.poolId}</p>
                            <p><strong>Year:</strong> {pool.year}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">No active pool found for this account.</p>
                    )}
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CB Before</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CB After</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!pool || pool.members.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No members in pool.</td>
                                </tr>
                            ) : (
                                pool.members.map((member) => (
                                    <tr key={member.shipId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.shipId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.cbBefore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.cbAfter}</td>
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
