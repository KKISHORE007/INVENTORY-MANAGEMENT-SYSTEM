import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit2 } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialForm = { name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '' };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier created');
      }
      setIsModalOpen(false);
      setFormData(initialForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving supplier');
    }
  };

  const openEditModal = (supplier) => {
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || '',
    });
    setEditingId(supplier._id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
        <button
          onClick={() => {
            setFormData(initialForm);
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading suppliers...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.contactPerson || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(s)} className="text-blue-600 hover:text-blue-900 mx-2">
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No suppliers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST / Tax Number</label>
                  <input type="text" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
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

export default Suppliers;
