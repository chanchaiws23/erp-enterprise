import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, FileText } from 'lucide-react';
import api from '../lib/api';

export default function FinancePage() {
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sumRes, invRes, expRes] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/invoices'),
          api.get('/finance/expenses'),
        ]);
        setSummary(sumRes.data);
        setInvoices(invRes.data);
        setExpenses(expRes.data);
      } catch (err) {
        console.error('Failed to load finance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatCurrency = (v) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v || 0);

  const invoiceStatusColors = {
    unpaid: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-500 text-sm mt-1">Financial management and reporting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><TrendingUp className="w-4 h-4 text-green-500" /> Revenue</div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><TrendingDown className="w-4 h-4 text-red-500" /> Expenses</div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><DollarSign className="w-4 h-4 text-blue-500" /> Net Profit</div>
          <p className={`text-xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(summary?.netProfit)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><CreditCard className="w-4 h-4 text-orange-500" /> Receivables</div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.accountsReceivable)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Receipt className="w-4 h-4 text-purple-500" /> Payables</div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.accountsPayable)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Financial Overview</p>
              <p className="text-sm">Charts and detailed analytics will appear here</p>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              {invoices.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No invoices found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                      <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs text-blue-600">{inv.invoice_number}</td>
                        <td className="py-3">{inv.customer_name || '-'}</td>
                        <td className="py-3 text-gray-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('th-TH') : '-'}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                        <td className="py-3 text-right text-gray-500">{formatCurrency(inv.paid_amount)}</td>
                        <td className="py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${invoiceStatusColors[inv.status]}`}>{inv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="overflow-x-auto">
              {expenses.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No expenses found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Expense #</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Department</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs">{exp.expense_number}</td>
                        <td className="py-3">{exp.category}</td>
                        <td className="py-3 text-gray-500">{exp.department_name || '-'}</td>
                        <td className="py-3 text-gray-500">{exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('th-TH') : '-'}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(exp.amount)}</td>
                        <td className="py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${exp.status === 'paid' ? 'bg-green-100 text-green-700' : exp.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{exp.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
