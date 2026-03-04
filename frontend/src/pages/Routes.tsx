import { useEffect, useState, useCallback } from 'react';
import { routesService } from '../services';
import { Route } from '../types';

export default function Routes() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [vesselType, setVesselType] = useState<string>('');
    const [fuelType, setFuelType] = useState<string>('');
    const [year, setYear] = useState<number>(2025);

    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            // Using seeded ship data for demo
            const response = await routesService.getRoutes('IMO-1111111', year, vesselType, fuelType);
            setRoutes(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    }, [year, vesselType, fuelType]);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleSetBaseline = async (routeId: string) => {
        try {
            await routesService.setBaseline(routeId);
            fetchRoutes(); // Refresh the list
        } catch (err: any) {
            alert(err.message || 'Failed to set baseline');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Routes</h1>

            {error && <p className="text-red-500 mb-4">Error: {error}</p>}

            {/* Filters */}
            <div className="mb-6 flex space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <select className="border border-gray-300 rounded-md p-2 text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vessel Type</label>
                    <select className="border border-gray-300 rounded-md p-2 text-sm" value={vesselType} onChange={e => setVesselType(e.target.value)}>
                        <option value="">All Vessels</option>
                        <option value="Container Ship">Container Ship</option>
                        <option value="Bulk Carrier">Bulk Carrier</option>
                        <option value="Ro-Ro Cargo">Ro-Ro Cargo</option>
                        <option value="Cruise Ship">Cruise Ship</option>
                        <option value="Oil Tanker">Oil Tanker</option>
                        <option value="Gas Carrier">Gas Carrier</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select className="border border-gray-300 rounded-md p-2 text-sm" value={fuelType} onChange={e => setFuelType(e.target.value)}>
                        <option value="">All Fuels</option>
                        <option value="HFO">HFO</option>
                        <option value="MGO">MGO</option>
                        <option value="VLSFO">VLSFO</option>
                        <option value="LNG">LNG</option>
                        <option value="Methanol">Methanol</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading routes...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption (t)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance (km)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emissions (t)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {routes.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">No routes found.</td>
                                </tr>
                            ) : (
                                routes.map((route) => (
                                    <tr key={route.routeId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.routeId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vesselType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.fuelType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.ghgIntensity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.fuelConsumptionTonnes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distanceKm}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.totalEmissionsTonnes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {route.isBaseline ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yes</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!route.isBaseline ? (
                                                <button
                                                    onClick={() => handleSetBaseline(route.routeId)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Set Baseline
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 cursor-not-allowed">Active</span>
                                            )}
                                        </td>
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
