import { useState, useEffect } from 'react';
import { Package, AlertTriangle, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    revenueThisMonth: 0,
    recentSales: [],
    recentMovements: [],
    salesDataChart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Products', value: data.totalProducts, icon: <Package className="w-8 h-8 text-blue-500" />, bg: 'bg-blue-50', link: '/products' },
    { title: 'Low Stock Items', value: data.lowStockCount, icon: <AlertTriangle className="w-8 h-8 text-red-500" />, bg: 'bg-red-50', link: '/inventory' },
    { title: 'Total Value', value: `$${data.totalInventoryValue.toLocaleString()}`, icon: <DollarSign className="w-8 h-8 text-green-500" />, bg: 'bg-green-50', link: '/inventory' },
    { title: 'Revenue (MTD)', value: `$${data.revenueThisMonth.toLocaleString()}`, icon: <TrendingUp className="w-8 h-8 text-purple-500" />, bg: 'bg-purple-50', link: '/sales-orders' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <Link to={card.link} className="text-xs text-primary hover:underline mt-2 inline-block">View details &rarr;</Link>
            </div>
            <div className={`${card.bg} p-4 rounded-full`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sales Overview (Last 6 Months)</h2>
          <div className="h-72 w-full">
            {data.salesDataChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesDataChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="Sales" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 italic">No sales data available yet.</div>
            )}
          </div>
        </div>

        {/* Recent Activity Lists */}
        <div className="space-y-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent Sales</h2>
              <Link to="/sales-orders" className="text-sm text-blue-600 hover:underline flex items-center">All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </div>
            <div className="space-y-4">
              {data.recentSales.map((so) => (
                <div key={so._id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{so.soNumber}</p>
                    <p className="text-xs text-gray-500">{so.customer?.name}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">+${so.totalAmount.toFixed(2)}</span>
                </div>
              ))}
              {data.recentSales.length === 0 && <p className="text-sm text-gray-500 text-center">No recent sales.</p>}
            </div>
          </div>

          {/* Recent Stock Movements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Stock Activity</h2>
              <Link to="/inventory" className="text-sm text-blue-600 hover:underline flex items-center">All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </div>
            <div className="space-y-4">
              {data.recentMovements.map((mov) => (
                <div key={mov._id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate w-32">{mov.product?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(mov.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${mov.type === 'IN' ? 'text-blue-600' : 'text-orange-500'}`}>
                    {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                  </span>
                </div>
              ))}
              {data.recentMovements.length === 0 && <p className="text-sm text-gray-500 text-center">No recent activity.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
