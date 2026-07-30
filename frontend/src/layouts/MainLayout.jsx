import { Outlet } from 'react-router-dom';
import { Package } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Package className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-800">InventorySystem</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Navigation Links Placeholder */}
          <div className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md font-medium cursor-pointer">
            Dashboard
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar Placeholder */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
