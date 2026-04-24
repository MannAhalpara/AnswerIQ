'use client';

import { useMemo, useState, useEffect } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import SearchInput from '@/components/SearchInput';
import { Loader2, FileX } from 'lucide-react';

interface UploadRecord {
  id: string;
  department: string;
  course: string;
  type: string;
  uploadedBy: string;
  date: string;
}

export default function PastUploadsPage() {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [typeFilter, setTypeFilter] = useState('All Types');

  useEffect(() => {
    async function fetchUploads() {
      try {
        const response = await fetch('http://localhost:8000/admin/past-uploads');
        if (!response.ok) throw new Error('Failed to fetch upload history');
        const data = await response.json();
        setRecords(data || []);
      } catch (err) {
        console.error('Error fetching uploads:', err);
        setError('Failed to load upload records. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchUploads();
  }, []);

  const departmentOptions = useMemo(() => {
    if (!records.length) return ['All Departments'];
    const departments = new Set(records.map((r) => r.department));
    return ['All Departments', ...Array.from(departments).filter(Boolean)];
  }, [records]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          (record.course || '').toLowerCase().includes(search.toLowerCase()) ||
          (record.department || '').toLowerCase().includes(search.toLowerCase()) ||
          (record.uploadedBy || '').toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = departmentFilter === 'All Departments' || record.department === departmentFilter;
        const matchesType = typeFilter === 'All Types' || record.type === typeFilter;
        return matchesSearch && matchesDepartment && matchesType;
      }),
    [records, search, departmentFilter, typeFilter],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          <p className="text-gray-500 font-medium">Loading Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="max-w-md p-8 text-center mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Upload history</p>
          <h1 className="text-2xl font-semibold text-gray-900">Past Uploads</h1>
        </div>
        <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Records Log</div>
      </header>

      <div className="p-8 space-y-6">
        <Card className="rounded-[2rem] border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <SearchInput
                placeholder="Search by department, course, or uploader..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <select
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {['All Types', 'Question Paper', 'Reference Answer', 'Student Answer'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0 rounded-[2rem] border-gray-100 shadow-sm">
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto text-left">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-8 py-5">Department</th>
                    <th className="px-8 py-5">Course</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5">Uploaded By</th>
                    <th className="px-8 py-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-900">{record.department}</td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-medium">{record.course}</td>
                      <td className="px-8 py-5">
                         <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-900 text-white shadow-sm">
                           {record.type}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">{record.uploadedBy}</td>
                      <td className="px-8 py-5 text-sm text-gray-400 text-right font-medium">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
               <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300">
                  <FileX className="w-10 h-10" />
               </div>
               <div>
                 <h3 className="text-xl font-semibold text-gray-900">No upload history found</h3>
                 <p className="text-sm text-gray-500 mt-2">There are no records matching your criteria.</p>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
