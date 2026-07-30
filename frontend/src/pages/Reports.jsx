import { FileSpreadsheet, Download, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Reports = () => {
  
  const handleDownload = async (endpoint, filename) => {
    try {
      // The API returns CSV text directly. 
      // We'll use axios config to handle blob response if needed, 
      // but since it's text/csv we can just grab the string and trigger download.
      const res = await api.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success(`${filename} downloaded successfully!`);
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Reports Module</h1>
        <span className="text-sm text-gray-500">Export your data securely</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stock Valuation Report */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Stock Valuation</h2>
          </div>
          <p className="text-gray-600 mb-6 flex-grow">
            Export a complete CSV of all products, their current stock levels, cost prices, and total calculated value.
          </p>
          <button 
            onClick={() => handleDownload('/reports/stock-valuation', 'stock-valuation.csv')}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Download CSV
          </button>
        </div>

        {/* Low Stock Report */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Low Stock Alert</h2>
          </div>
          <p className="text-gray-600 mb-6 flex-grow">
            Export a list of all products that have fallen to or below their designated reorder level.
          </p>
          <button 
            onClick={() => handleDownload('/reports/low-stock', 'low-stock.csv')}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </button>
        </div>

        {/* Sales Report */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Confirmed Sales</h2>
          </div>
          <p className="text-gray-600 mb-6 flex-grow">
            Export a log of all confirmed sales orders, including customer details and total order value.
          </p>
          <button 
            onClick={() => handleDownload('/reports/sales', 'sales-report.csv')}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </button>
        </div>

      </div>
    </div>
  );
};

export default Reports;
