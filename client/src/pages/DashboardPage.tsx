import { useState, useEffect, type FC } from 'react';
import {
  Users, Package, ShoppingCart, DollarSign,
  AlertTriangle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight,
  Activity, Zap, BarChart3, PieChart, ArrowRight, Eye,
  type LucideIcon
} from 'lucide-react';
import api from '../lib/api';

// --- Types ---
interface Overview {
  totalEmployees: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockAlerts: number;
  pendingLeaveRequests: number;
}

interface RecentOrder {
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  order_date: string;
}

interface DeptStat {
  name: string;
  code: string;
  employee_count: number;
  budget: number;
}

interface DashboardData {
  overview: Overview;
  recentOrders: RecentOrder[];
  departmentStats: DeptStat[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  change?: string;
  changeType?: 'up' | 'down';
  sparkData?: number[];
}

// --- Mini Sparkline SVG ---
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// --- Stat Card ---
const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, gradient, iconBg, change, changeType, sparkData }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${gradient}`}>
    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-sm" />
    <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/5" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sparkData && <Sparkline data={sparkData} color="rgba(255,255,255,0.7)" />}
      </div>
      <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${changeType === 'up' ? 'text-green-200' : 'text-red-200'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {change}
        </div>
      )}
    </div>
  </div>
);

// --- Helpers ---
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('th-TH').format(n);
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  shipped: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  confirmed: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  draft: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const deptColors: string[] = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
];

// --- Quick Action Button ---
function QuickAction({ icon: Icon, label, desc }: { icon: LucideIcon; label: string; desc: string }) {
  return (
    <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left w-full group">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
    </button>
  );
}

// --- Main Dashboard ---
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const ov = stats?.overview ?? { totalEmployees: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, lowStockAlerts: 0, pendingLeaveRequests: 0 };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time overview of your enterprise operations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Last updated: just now</span>
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats Grid — Gradient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Employees" value={formatNumber(ov.totalEmployees)} icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700" iconBg="bg-blue-400/30"
          change="+3 this month" changeType="up"
          sparkData={[3, 5, 4, 6, 5, 7, 6]}
        />
        <StatCard
          title="Products" value={formatNumber(ov.totalProducts)} icon={Package}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" iconBg="bg-emerald-400/30"
          sparkData={[5, 6, 7, 6, 8, 7, 8]}
        />
        <StatCard
          title="Orders" value={formatNumber(ov.totalOrders)} icon={ShoppingCart}
          gradient="bg-gradient-to-br from-violet-500 to-violet-700" iconBg="bg-violet-400/30"
          change="+12%" changeType="up"
          sparkData={[2, 4, 3, 6, 5, 8, 7]}
        />
        <StatCard
          title="Revenue" value={formatCurrency(ov.totalRevenue)} icon={DollarSign}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600" iconBg="bg-amber-400/30"
          change="+8.5%" changeType="up"
          sparkData={[10, 15, 12, 18, 20, 17, 22]}
        />
        <StatCard
          title="Low Stock" value={formatNumber(ov.lowStockAlerts)} icon={AlertTriangle}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700" iconBg="bg-rose-400/30"
          change={ov.lowStockAlerts > 0 ? 'Needs attention' : ''} changeType="down"
        />
        <StatCard
          title="Leave Pending" value={formatNumber(ov.pendingLeaveRequests)} icon={Clock}
          gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" iconBg="bg-cyan-400/30"
        />
      </div>

      {/* Middle Row: Quick Actions + Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <QuickAction icon={ShoppingCart} label="New Sales Order" desc="Create a new order for a customer" />
            <QuickAction icon={Users} label="Add Employee" desc="Onboard a new team member" />
            <QuickAction icon={Package} label="Stock Adjustment" desc="Update inventory quantities" />
            <QuickAction icon={BarChart3} label="Generate Report" desc="Export analytics & insights" />
          </div>
        </div>

        {/* Revenue Overview Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
            </div>
            <div className="flex gap-1">
              {['7D', '1M', '3M', '1Y'].map((label) => (
                <button key={label} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${label === '1M' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Revenue Bars */}
          <div className="flex items-end gap-2 h-48 px-2">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => {
              const heights = [45, 62, 38, 70, 55, 80, 65, 90, 75, 85, 68, 92];
              const h = heights[i];
              const isHighlight = i >= 10;
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full relative">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${isHighlight ? 'bg-gradient-to-t from-violet-600 to-violet-400' : 'bg-gradient-to-t from-blue-400/60 to-blue-300/40'}`}
                      style={{ height: `${h * 1.8}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{m}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Total Revenue (YTD)</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(ov.totalRevenue)}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              <ArrowUpRight className="w-4 h-4" /> +18.2% vs last year
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Orders + Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-900">Recent Orders</h3>
            </div>
            <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-5">
            {(stats?.recentOrders || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">No orders yet</p>
                <p className="text-xs">Orders will appear here when created</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats!.recentOrders.map((order, i) => {
                  const sc = statusConfig[order.status] || statusConfig.draft;
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        #{(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{order.order_number}</p>
                        <p className="text-xs text-gray-500 truncate">{order.customer_name || 'Walk-in Customer'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-gray-900">Department Overview</h3>
            </div>
            <span className="text-xs text-gray-400">{stats?.departmentStats?.length || 0} departments</span>
          </div>
          <div className="p-5 space-y-3">
            {(stats?.departmentStats || []).map((dept, i) => {
              const maxBudget = Math.max(...(stats?.departmentStats || []).map(d => Number(d.budget) || 0));
              const pct = maxBudget > 0 ? (Number(dept.budget) / maxBudget) * 100 : 0;
              const colorClass = deptColors[i % deptColors.length];
              return (
                <div key={i} className="group p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                        <span className="text-[10px] font-bold text-white">{dept.code}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500">{dept.employee_count} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(dept.budget))}</p>
                      <p className="text-[10px] text-gray-400">budget</p>
                    </div>
                  </div>
                  {/* Budget Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
