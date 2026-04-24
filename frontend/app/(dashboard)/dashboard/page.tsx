'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Clock, CheckCircle, BookOpen, Loader2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchInput from '@/components/SearchInput';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';

interface Student {
  id: string;
  name: string;
  usn: string;
  subject: string;
  status: string;
  avatarSeed: number;
  raw_student_id: string;
  raw_course_id: string;
}

interface Subject {
  code: string;
  name: string;
}

interface DashboardData {
  faculty_name: string;
  total_students: number;
  pending_evaluations: number;
  completed_evaluations: number;
  assigned_subjects: Subject[];
  students_list: Student[];
}

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/faculty/dashboard-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Connection error. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-red-500 font-medium mb-4">{error || 'Something went wrong'}</p>
        <Link href="/faculty/login" className="text-gray-900 font-medium underline">
          Back to Login
        </Link>
      </div>
    );
  }

  const filtered = data.students_list.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.usn.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === 'All Subjects' || s.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Faculty Dashboard</h1>
        <Link href="/settings" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer group">
          <span className="text-sm text-gray-500 group-hover:text-gray-900 font-medium">{data.faculty_name}</span>
          <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-sm font-semibold text-white">
            {data.faculty_name.charAt(0)}
          </div>
        </Link>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Stats row */}
        <div className="flex gap-5">
          <StatCard label="Total Students" value={data.total_students} icon={<Users className="w-5 h-5 text-gray-500" />} />
          <StatCard label="Pending Evaluations" value={data.pending_evaluations} icon={<Clock className="w-5 h-5 text-gray-500" />} />
          <StatCard label="Completed" value={data.completed_evaluations} icon={<CheckCircle className="w-5 h-5 text-gray-500" />} />
        </div>

        {/* Assigned Subjects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Assigned Subjects</h2>
          <div className="flex gap-4">
            {data.assigned_subjects.length > 0 ? (
              data.assigned_subjects.map((subj) => (
                <div
                  key={subj.code}
                  className="flex items-center gap-3 flex-1 border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{subj.name}</p>
                    <p className="text-xs text-gray-400">{subj.code}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No subjects assigned.</p>
            )}
          </div>
        </div>

        {/* Student Evaluations Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Student Evaluations</h2>

          {/* Search + filter row */}
          <div className="flex gap-3 mb-5">
            <SearchInput
              containerClassName="flex-1"
              placeholder="Search by Name or USN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none pr-8 cursor-pointer"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option>All Subjects</option>
              {data.assigned_subjects.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Student Name', 'USN Number', 'Subject', 'Status', 'Action'].map((col) => (
                    <th
                      key={col}
                      className="text-xs font-medium text-gray-500 text-left pb-3 pr-4 last:text-right"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.name} seed={student.avatarSeed} />
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-gray-600">{student.usn}</td>
                    <td className="py-3.5 pr-4 text-sm text-gray-600">{student.subject}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        student.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                        student.status === 'Pending Evaluation' ? 'bg-amber-50 text-amber-600' : 
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href={`/evaluation?studentId=${student.raw_student_id}&courseId=${student.raw_course_id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {data.students_list.length} results</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              {[1].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 text-xs rounded-lg ${
                    p === 1 ? 'bg-gray-900 text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
