import { useEffect, useState, useCallback } from 'react';
import { poolsService } from '../services';
import { Pool } from '../types';

export default function Pools() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create Pool State
    const [createYear, setCreateYear] = useState<number>(2025);
    const [createShips, setCreateShips] = useState<string>('IMO-1111111, IMO-2222222');
    const [actionLoading, setActionLoading] = useState(false);

    const activeShipId = 'IMO-1111111'; // Hardcoded for demo

    const fetchPools = useCallback(async () => {
        try {
            setLoading(true);
            const response = await poolsService.listPools();
            setPools(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch pool data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

    const handleCreatePool = async () => {
        if (!createShips.trim()) return;
        try {
            setActionLoading(true);
            const shipIdsArray = createShips.split(',').map(s => s.trim()).filter(s => s);
            await poolsService.createPool(createYear, shipIdsArray);
            setCreateShips('IMO-1111111'); // Reset
            fetchPools();
        } catch (err: any) {
            alert(err.message || 'Failed to create pool. Note: Total pool CB must be >= 0.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoinPool = async (poolId: string) => {
        try {
            setActionLoading(true);
            await poolsService.joinPool(poolId, activeShipId);
            fetchPools();
        } catch (err: any) {
            alert(err.message || 'Failed to join pool.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeavePool = async (poolId: string) => {
        try {
            setActionLoading(true);
            await poolsService.leavePool(poolId, activeShipId);
            fetchPools();
        } catch (err: any) {
            alert(err.message || 'Failed to leave pool.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pooling (Article 21)</h1>

            {error && <p className="text-red-500 mb-4">Error: {error}</p>}

            {/* Create Pool Form */}
            <div className="bg-white border rounded-lg p-6 shadow-sm flex flex-col justify-center mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Pool</h3>
                <p className="text-xs text-gray-500 mb-4">
                    Combine ships to share compliance balance. The total compliance balance of all ships in the pool must be positive or zero.
                </p>
                <div className="flex space-x-4 mb-4">
                    <div className="w-1/4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                        <select className="w-full border border-gray-300 rounded-md p-2 text-sm" value={createYear} onChange={e => setCreateYear(Number(e.target.value))}>
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <div className="w-3/4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ship IDs (comma separated)</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            placeholder="IMO-1111111, IMO-2222222"
                            value={createShips}
                            onChange={(e) => setCreateShips(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleCreatePool}
                    disabled={actionLoading || !createShips.trim()}
                    className="py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {actionLoading ? 'Creating...' : 'Create Pool'}
                </button>
            </div>

            {loading ? (
                <p>Loading pool data...</p>
            ) : (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Active Pools</h3>
                    {pools.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-4">No pools found. Create one above.</p>
                    ) : (
                        pools.map((pool) => {
                            const isMember = pool.members.some(m => m.shipId === activeShipId);

                            return (
                                <div key={pool.poolId} className="mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Pool ID: <span className="text-xs text-gray-500 font-mono">{pool.poolId}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">Year: {pool.year}</p>
                                        </div>
                                        <div>
                                            {isMember ? (
                                                <button
                                                    onClick={() => handleLeavePool(pool.poolId)}
                                                    disabled={actionLoading}
                                                    className="text-xs font-medium bg-white border border-red-300 text-red-700 hover:bg-red-50 py-1.5 px-3 rounded shadow-sm disabled:opacity-50"
                                                >
                                                    Leave Pool
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoinPool(pool.poolId)}
                                                    disabled={actionLoading}
                                                    className="text-xs font-medium bg-indigo-50 border border-indigo-300 text-indigo-700 hover:bg-indigo-100 py-1.5 px-3 rounded shadow-sm disabled:opacity-50"
                                                >
                                                    Join Pool
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unadjusted CB</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pooled CB Allocation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-50">
                                            {pool.members.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No members in pool.</td>
                                                </tr>
                                            ) : (
                                                pool.members.map((member) => (
                                                    <tr key={member.shipId} className={member.shipId === activeShipId ? "bg-indigo-50" : ""}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {member.shipId} {member.shipId === activeShipId && "(You)"}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {member.cbBefore}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${member.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {member.cbAfter}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
