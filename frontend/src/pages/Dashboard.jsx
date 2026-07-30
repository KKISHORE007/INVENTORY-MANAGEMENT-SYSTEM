const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder Stats Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Metric {i}</h3>
            <p className="text-3xl font-bold text-gray-900">1,234</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chart will be rendered here
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
