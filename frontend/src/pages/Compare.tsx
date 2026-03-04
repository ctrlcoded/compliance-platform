import { useEffect, useState } from 'react';
import { routesService } from '../services';
import { Comparison } from '../types';

export default function Compare() {
    const [data, setData] = useState<Comparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                setLoading(true);
                // Currently using seeded ship ID for demo purposes
                const response = await routesService.getComparison('IMO-1111111', 2025);
                setData(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch comparison data');
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Compare Routes vs Baseline</h1>

            {loading && <p>Loading comparison data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && data && (
                <div>
                    <div className="mb-6 bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Baseline Information</h3>
                        {data.baseline ? (
                            <div className="text-sm text-gray-700">
                                <p><strong>Baseline Route ID:</strong> {data.baseline.routeId}</p>
                                <p><strong>Target Intensity:</strong> {data.target} gCO₂eq/MJ</p>
                                <p><strong>Baseline Intensity:</strong> {data.baseline.ghgIntensity} gCO₂eq/MJ</p>
                            </div>
                        ) : (
                            <p className="text-sm text-red-500">No baseline route set for this year.</p>
                        )}
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Route Comparisons</h3>
                    {data.comparisons.length === 0 ? (
                        <p className="text-sm text-gray-500">No other routes available to compare.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline Intensity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Intensity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Difference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.comparisons.map((comp) => (
                                    <tr key={comp.routeId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.routeId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {data.baseline ? data.baseline.ghgIntensity : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.ghgIntensity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {comp.percentDiff.toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {comp.compliant ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Compliant
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Non-Compliant
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
