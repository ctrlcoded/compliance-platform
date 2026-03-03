import { useEffect, useState } from 'react';
import { bankingService } from '../services';
import { BankEntry } from '../types';

export default function Banking() {
    const [entries, setEntries] = useState<BankEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                setLoading(true);
                // Using sample shipId 'S1' for prototype scaffolding
                const response = await bankingService.getLedger('S1');
                setEntries(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch banking ledger');
            } finally {
                setLoading(false);
            }
        };

        fetchLedger();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Banking Ledger</h1>

            {loading && <p>Loading ledger...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
