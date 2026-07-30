import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, CheckCircle, Clock } from 'lucide-react';

const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    supplier: '',
    warehouse: '',
    expectedDeliveryDate: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchPOs();
    fetchDropdownData();
  }, []);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders');
      setPos(res.data.data);
    } catch (err) {
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setSuppliers(supRes.data.data);
      setWarehouses(whRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, costPrice: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill cost price if product is selected
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newItems[index].costPrice = selectedProduct.costPrice;
      }
    }
    
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
      await api.post('/purchase-orders', formData);
      toast.success('Purchase Order created');
      setIsModalOpen(false);
      setFormData({ supplier: '', warehouse: '', expectedDeliveryDate: '', notes: '', items: [] });
      fetchPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating PO');
    }
  };

  const handleReceive = async (poId) => {
    if (window.confirm('Receive all items for this PO? This will update inventory.')) {
      try {
        await api.post(`/purchase-orders/${poId}/receive`);
        toast.success('PO Received and Inventory Updated');
        fetchPOs();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error receiving PO');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
        <button
          onClick={() => {
            setFormData({ supplier: '', warehouse: '', expectedDeliveryDate: '', notes: '', items: [] });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Create PO
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading POs...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pos.map((po) => (
                <tr key={po._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{po.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      po.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${po.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {po.status !== 'Received' && (
                      <button onClick={() => handleReceive(po._id)} className="text-green-600 hover:text-green-900 flex items-center justify-end w-full">
                        <CheckCircle className="w-4 h-4 mr-1" /> Receive
                      </button>
                    )}
                    {po.status === 'Received' && (
                      <span className="text-gray-400 flex items-center justify-end w-full"><Clock className="w-4 h-4 mr-1" /> Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No Purchase Orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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
                  <h3 className="font-semibold text-gray-700">Order Items</h3>
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
                    <div className="w-32">
                      <input type="number" step="0.01" required placeholder="Cost" value={item.costPrice} onChange={(e) => updateItem(index, 'costPrice', Number(e.target.value))} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-bold">X</button>
                  </div>
                ))}
                {formData.items.length === 0 && <p className="text-sm text-gray-400 italic">No items added yet.</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
