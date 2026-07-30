import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, LayoutDashboard, ListTree, LogOut, Tags, Warehouse, Boxes, Users, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Inventory', path: '/inventory', icon: <Boxes className="w-5 h-5 mr-3" /> },
    { name: 'Products', path: '/products', icon: <Tags className="w-5 h-5 mr-3" /> },
    { name: 'Categories', path: '/categories', icon: <ListTree className="w-5 h-5 mr-3" /> },
    { name: 'Warehouses', path: '/warehouses', icon: <Warehouse className="w-5 h-5 mr-3" /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCart className="w-5 h-5 mr-3" /> },
  ];

  const currentRouteName = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Package className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-800">InventorySystem</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md font-medium transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-blue-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-0">
          <h1 className="text-lg font-semibold text-gray-700">{currentRouteName}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold cursor-pointer">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
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
