import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const initialForm = { name: '', sku: '', category: '', costPrice: '', sellingPrice: '' };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/products${searchQuery ? `?search=${searchQuery}` : ''}`);
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData);
        toast.success('Product created');
      }
      setIsModalOpen(false);
      setFormData(initialForm);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category?._id || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </form>
          
          <button
            onClick={() => {
              setFormData(initialForm);
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2 hidden sm:block" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Cost/Sell)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${p.costPrice} / ${p.sellingPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {p.currentStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-900 mx-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-900 mx-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input type="number" step="0.01" required value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input type="number" step="0.01" required value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
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

export default Products;
