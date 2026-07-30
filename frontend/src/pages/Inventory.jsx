import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN'); // IN, OUT, ADJUSTMENT
  const initialForm = { product: '', warehouse: '', quantity: '', reason: '', type: 'IN' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err) {}
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/movement', {
        ...formData,
        quantity: Number(formData.quantity)
      });
      toast.success('Stock movement recorded successfully');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording movement');
    }
  };

  const openMovementModal = (type) => {
    setMovementType(type);
    setFormData({ ...initialForm, type });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => openMovementModal('IN')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Stock In
          </button>
          <button
            onClick={() => openMovementModal('OUT')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
          >
            <ArrowUpFromLine className="w-4 h-4 mr-2" /> Stock Out
          </button>
          <button
            onClick={() => openMovementModal('ADJUSTMENT')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Adjust
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.product?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.product?.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.warehouse?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{inv.quantity}</td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No inventory records found. Add stock to begin.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {movementType === 'IN' && 'Stock In'}
              {movementType === 'OUT' && 'Stock Out'}
              {movementType === 'ADJUSTMENT' && 'Stock Adjustment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select required value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select required value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity {movementType === 'ADJUSTMENT' ? '(use negative for deduction)' : ''}
                </label>
                <input type="number" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference</label>
                <input type="text" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="e.g. Restock, Damaged, Recount" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-white rounded-md ${movementType === 'IN' ? 'bg-green-600 hover:bg-green-700' : movementType === 'OUT' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
