import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-gray-900">Compliance Platform</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <NavLink to="/dashboard" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                    Dashboard
                                </NavLink>
                                <NavLink to="/routes" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                    Routes
                                </NavLink>
                                <NavLink to="/banking" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                    Banking
                                </NavLink>
                                <NavLink to="/pools" className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                    Pools
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
                <Outlet />
            </main>
        </div>
    );
}
