import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, CheckCircle, RefreshCcw } from 'lucide-react';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    customer: '',
    salesOrder: '',
    warehouse: '',
    refundAmount: 0,
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchReturns();
    fetchDropdownData();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns');
      setReturns(res.data.data);
    } catch (err) {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [custRes, whRes, prodRes, soRes] = await Promise.all([
        api.get('/customers'),
        api.get('/warehouses'),
        api.get('/products'),
        api.get('/sales-orders')
      ]);
      setCustomers(custRes.data.data);
      setWarehouses(whRes.data.data);
      setProducts(prodRes.data.data);
      setSalesOrders(soRes.data.data);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, reason: 'Other', condition: 'Resellable' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      return toast.error('Please add at least one item');
    }
    try {
      await api.post('/returns', formData);
      toast.success('Return created successfully');
      setIsModalOpen(false);
      setFormData({ customer: '', salesOrder: '', warehouse: '', refundAmount: 0, notes: '', items: [] });
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating return');
    }
  };

  const handleProcess = async (returnId) => {
    if (window.confirm('Process this return? Resellable items will be restocked.')) {
      try {
        await api.post(`/returns/${returnId}/process`);
        toast.success('Return Processed and Stock Updated');
        fetchReturns();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error processing return');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Returns Management</h1>
        <button
          onClick={() => {
            setFormData({ customer: '', salesOrder: '', warehouse: '', refundAmount: 0, notes: '', items: [] });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Return
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading Returns...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map((ret) => (
                <tr key={ret._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{ret.returnNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ret.customer?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ret.salesOrder?.soNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ret.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${ret.refundAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {ret.status === 'Pending' && (
                      <button onClick={() => handleProcess(ret._id)} className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full">
                        <CheckCircle className="w-4 h-4 mr-1" /> Process
                      </button>
                    )}
                    {ret.status === 'Processed' && (
                      <span className="text-gray-400 flex items-center justify-end w-full"><RefreshCcw className="w-4 h-4 mr-1" /> Restocked</span>
                    )}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No Returns found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Log a Return</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select required value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order</label>
                  <select required value={formData.salesOrder} onChange={(e) => setFormData({...formData, salesOrder: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select SO</option>
                    {salesOrders.map(so => <option key={so._id} value={so._id}>{so.soNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receive to Warehouse</label>
                  <select required value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">Returned Items</h3>
                  <button type="button" onClick={addItemRow} className="text-sm text-primary hover:text-blue-700 font-medium flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <select required value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="w-24">
                      <input type="number" min="1" required placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    <div className="w-48">
                      <select required value={item.reason} onChange={(e) => updateItem(index, 'reason', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                        <option value="Damaged">Damaged</option>
                        <option value="Wrong Item">Wrong Item</option>
                        <option value="Customer Changed Mind">Changed Mind</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="w-36">
                      <select required value={item.condition} onChange={(e) => updateItem(index, 'condition', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                        <option value="Resellable">Resellable</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-bold">X</button>
                  </div>
                ))}
                {formData.items.length === 0 && <p className="text-sm text-gray-400 italic">No items added yet.</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount ($)</label>
                  <input type="number" step="0.01" value={formData.refundAmount} onChange={(e) => setFormData({...formData, refundAmount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600">Save Return Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
