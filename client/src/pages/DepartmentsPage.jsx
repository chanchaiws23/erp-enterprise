import { useState, useEffect } from 'react';
import { Building2, Plus, Users, DollarSign } from 'lucide-react';
import api from '../lib/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatCurrency = (v) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Organization structure and budget management</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{dept.code}</span>
                </div>
              </div>
            </div>

            {dept.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.description}</p>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{dept.employee_count}</span>
                <span className="text-gray-400">employees</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatCurrency(dept.budget)}</span>
              </div>
            </div>

            {dept.manager_name && (
              <div className="mt-3 text-xs text-gray-500">
                Manager: <span className="font-medium text-gray-700">{dept.manager_name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
