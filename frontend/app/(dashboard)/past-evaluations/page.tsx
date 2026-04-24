'use client';

import { useState, useEffect } from 'react';
import { Bell, FileText, Calendar, BarChart2, Users, RefreshCw, Filter } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import StatCard from '@/components/StatCard';
import { subjects } from '@/lib/mockData';
import { useFacultyAuth } from '@/lib/auth';

export default function PastEvaluationsPage() {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [allChecked, setAllChecked] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total_evaluations?: number; this_month?: number; average_marks?: number | null; students_evaluated?: number } | null>(null);

  const { getToken } = useFacultyAuth();

  // simple string hash for deterministic seed
  function hashCode(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  useEffect(() => {
    const token = getToken();
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/faculty/past-evaluations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          console.error('Failed to fetch past evaluations', await res.text());
          return;
        }
        const data = await res.json();
        // ensure avatarSeed exists for Avatar component
        const prepared = (data.evaluations || []).map((e: any, idx: number) => ({
          ...e,
          avatarSeed: e.avatarSeed ?? (Math.abs(hashCode(e.id || String(idx))) % 100),
        }));
        setEvaluations(prepared);
        setStats(data.stats || null);
      } catch (err) {
        console.error('Error fetching past evaluations', err);
      }
    };

    fetchData();
  }, []);


  const now = new Date();

  const filtered = evaluations.filter((e) => {
    const matchSearch =
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.usn || '').toLowerCase().includes(search.toLowerCase());
    const matchSubject = selectedSubject === 'All Subjects' || e.subject === selectedSubject;

    // Show only evaluations that happened previously (date <= today)
    const parsed = e.date ? new Date(e.date) : null;
    const validDate = parsed ? !isNaN(parsed.getTime()) : false;
    const isPast = validDate ? parsed!.getTime() <= now.getTime() : true;

    return matchSearch && matchSubject && isPast;
  });

  const toggleAll = () => {
    if (allChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(filtered.map((e) => e.id)));
    }
    setAllChecked(!allChecked);
  };

  const toggleRow = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Past Evaluations</h1>
          <p className="text-sm text-gray-400 mt-0.5">View and manage previous evaluation records</p>
        </div>
        <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Subject</label>
            <div className="relative">
              <select
                className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer min-w-40"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option>All Subjects</option>
                {subjects.map((s) => <option key={s.code}>{s.name}</option>)}
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Start Date</label>
            <div className="relative">
              <input
                type="text"
                defaultValue="2025-01-01"
                className="border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">End Date</label>
            <div className="relative">
              <input
                type="text"
                defaultValue="2025-01-31"
                className="border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" /> Apply
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-5">
            <StatCard label="Total Evaluations" value={stats?.total_evaluations ?? 0} icon={<FileText className="w-5 h-5 text-gray-400" />} />
            <StatCard label="This Month" value={stats?.this_month ?? 0} icon={<Calendar className="w-5 h-5 text-gray-400" />} />
            <StatCard label="Average Marks" value={stats?.average_marks != null ? (Math.round((stats.average_marks + Number.EPSILON) * 10) / 10) : '-'} icon={<BarChart2 className="w-5 h-5 text-gray-400" />} />
            <StatCard label="Students" value={stats?.students_evaluated ?? 0} icon={<Users className="w-5 h-5 text-gray-400" />} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <SearchInput
              containerClassName="w-72"
              placeholder="Search by name or USN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <p className="text-sm text-gray-400">Showing {filtered.length} results</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 w-8">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                {['Student Name', 'USN', 'Subject', 'Marks', 'Date'].map((col) => (
                  <th key={col} className="text-xs font-medium text-gray-500 text-left pb-3 pr-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <input
                      type="checkbox"
                      checked={checked.has(ev.id)}
                      onChange={() => toggleRow(ev.id)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={ev.name} seed={ev.avatarSeed} />
                      <span className="text-sm font-medium text-gray-900">{ev.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-gray-600">{ev.usn}</td>
                  <td className="py-3.5 pr-4 text-sm text-gray-600">{ev.subject}</td>
                  <td className="py-3.5 pr-4 text-sm font-medium text-gray-900">{ev.marks}</td>
                  <td className="py-3.5 pr-4 text-sm text-gray-600">{ev.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            Showing 1 to {filtered.length} of {stats?.total_evaluations ?? '-'} entries
          </p>
        </div>
      </div>
    </div>
  );
}
