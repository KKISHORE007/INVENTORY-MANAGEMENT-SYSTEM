import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', contactPerson: '' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data);
    } catch (err) {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warehouses', formData);
      toast.success('Warehouse created');
      setIsModalOpen(false);
      setFormData({ name: '', location: '', contactPerson: '' });
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving warehouse');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Warehouse
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading warehouses...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warehouses.map((w) => (
                <tr key={w._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{w.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.contactPerson || '-'}</td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No warehouses found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Warehouse</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
