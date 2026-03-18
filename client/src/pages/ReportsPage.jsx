import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, DollarSign, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('sales');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const reports = [
    { id: 'sales', label: 'Sales by Month', icon: TrendingUp, endpoint: '/reports/sales-by-month' },
    { id: 'products', label: 'Top Products', icon: Package, endpoint: '/reports/top-products' },
    { id: 'employees', label: 'Employee Summary', icon: Users, endpoint: '/reports/employee-summary' },
    { id: 'inventory', label: 'Inventory Valuation', icon: Package, endpoint: '/reports/inventory-valuation' },
    { id: 'financial', label: 'Financial Overview', icon: DollarSign, endpoint: '/reports/financial-overview' },
  ];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const report = reports.find(r => r.id === activeReport);
        const res = await api.get(report.endpoint);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load report:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeReport]);

  const formatCurrency = (v) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v || 0);
  const formatNumber = (v) => new Intl.NumberFormat('th-TH').format(v || 0);

  const renderTable = () => {
    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (data.length === 0) return <p className="text-center py-12 text-gray-500">No data available for this report</p>;

    switch (activeReport) {
      case 'sales':
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Month</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Orders</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Avg Order</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.month}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(r.order_count)}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(r.total_revenue)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(r.avg_order_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'products':
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sold</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{r.sku}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(r.total_sold)}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(r.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'employees':
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Headcount</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Avg Salary</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Cost</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">On Leave</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.department}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(r.headcount)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(r.avg_salary)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(r.total_salary_cost)}</td>
                  <td className="py-3 px-4 text-right">{r.on_leave || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'inventory':
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Products</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Units</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Cost Value</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Retail Value</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Low Stock</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.category || 'Uncategorized'}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(r.product_count)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(r.total_units)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(r.total_cost_value)}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(r.total_retail_value)}</td>
                  <td className="py-3 px-4 text-right">{r.low_stock_items > 0 ? <span className="text-red-600 font-medium">{r.low_stock_items}</span> : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'financial':
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Account Type</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Accounts</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Balance</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium capitalize">{r.type}</td>
                  <td className="py-3 px-4 text-right">{r.account_count}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(r.total_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Business intelligence and analytics</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {reports.map((r) => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeReport === r.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <r.icon className="w-4 h-4" /> {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{reports.find(r => r.id === activeReport)?.label}</h3>
        </div>
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>
    </div>
  );
}
