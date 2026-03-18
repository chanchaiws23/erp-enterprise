import { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingCart, DollarSign,
  AlertTriangle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import api from '../lib/api';

function StatCard({ title, value, icon: Icon, color, change, changeType }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your enterprise operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Employees" value={overview.totalEmployees || 0} icon={Users} color="blue" change="+3 this month" changeType="up" />
        <StatCard title="Products" value={overview.totalProducts || 0} icon={Package} color="green" />
        <StatCard title="Sales Orders" value={overview.totalOrders || 0} icon={ShoppingCart} color="purple" change="+12%" changeType="up" />
        <StatCard title="Revenue" value={formatCurrency(overview.totalRevenue || 0)} icon={DollarSign} color="orange" change="+8.5%" changeType="up" />
        <StatCard title="Low Stock Alerts" value={overview.lowStockAlerts || 0} icon={AlertTriangle} color="red" />
        <StatCard title="Pending Leaves" value={overview.pendingLeaveRequests || 0} icon={Clock} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {(stats?.recentOrders || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              stats.recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.customer_name || 'Walk-in'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="space-y-3">
            {(stats?.departmentStats || []).map((dept, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{dept.code}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                    <p className="text-xs text-gray-500">{dept.employee_count} employees</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{formatCurrency(dept.budget)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
