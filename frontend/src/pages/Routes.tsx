import { useEffect, useState } from 'react';
import { routesService } from '../services';
import { Route } from '../types';

export default function Routes() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                // Using seeded ship data for demo
                const response = await routesService.getRoutes('IMO-1111111', 2025);
                setRoutes(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch routes');
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Routes</h1>

            {loading && <p>Loading routes...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {routes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No routes found.</td>
                            </tr>
                        ) : (
                            routes.map((route) => (
                                <tr key={route.routeId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.routeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.shipId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vesselType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.fuelType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.ghgIntensity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.isBaseline ? 'Yes' : 'No'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
