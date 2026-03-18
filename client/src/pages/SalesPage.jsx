import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/sales/orders', {
        params: { page, limit: 10, search: search || undefined, status: statusFilter || undefined }
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const formatCurrency = (v) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage customer orders</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); fetchOrders(1); }} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </form>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales Person</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-blue-600">{o.order_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{o.customer_name || 'Walk-in'}</p>
                      <p className="text-xs text-gray-500">{o.company || ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{o.sales_person_name || '-'}</td>
                    <td className="px-5 py-4 text-gray-500">{o.order_date ? new Date(o.order_date).toLocaleDateString('th-TH') : '-'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatCurrency(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
