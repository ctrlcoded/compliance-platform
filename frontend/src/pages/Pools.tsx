import { useEffect, useState } from 'react';
import { poolsService } from '../services';
import { Pool } from '../types';

export default function Pools() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPools = async () => {
            try {
                setLoading(true);
                const response = await poolsService.listPools();
                setPools(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch pool data');
            } finally {
                setLoading(false);
            }
        };

        fetchPools();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pools</h1>

            {loading && <p>Loading pool data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <div>
                    {pools.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-4">No pools found.</p>
                    ) : (
                        pools.map((pool) => (
                            <div key={pool.poolId} className="mb-8">
                                <div className="mb-4 text-sm text-gray-700">
                                    <p><strong>Pool ID:</strong> {pool.poolId}</p>
                                    <p><strong>Year:</strong> {pool.year}</p>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CB Before</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CB After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pool.members.length === 0 ? (
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
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
