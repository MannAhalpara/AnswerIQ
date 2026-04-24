'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BookOpen, Building, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Department } from '@/lib/mockData';

export default function AdminDashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('http://localhost:8000/admin/dashboard/data');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setDepartments(data);
        if (data.length > 0) {
          setSelectedDepartmentId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const selectedDepartment = departments.find((dept) => dept.id === selectedDepartmentId) || departments[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedDepartment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-500">No departments found in the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">Examination Dashboard</h1>
        </div>
        <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">Admin</div>
      </header>

      <div className="p-8 space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          {departments.map((department) => (
            <button
              key={department.id}
              type="button"
              onClick={() => setSelectedDepartmentId(department.id)}
              className={`rounded-3xl border p-5 text-left transition ${
                department.id === selectedDepartmentId
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white hover:border-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Department</p>
                  <h2 className="text-xl font-semibold">{department.name}</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{department.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{department.courses.length} courses</span>
                <span>{department.total_students} students</span>
              </div>
            </button>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Selected Department</p>
                <h2 className="text-xl font-semibold text-gray-900">{selectedDepartment.name}</h2>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {selectedDepartment.courses.length} Courses
              </span>
            </div>

            <div className="grid gap-4">
              {selectedDepartment.courses.map((course) => (
                <div key={course.id} className="rounded-3xl border border-gray-100 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">Assigned faculty: <span className="text-gray-900">{course.faculty.name}</span></p>
                  </div>
                  <div className="mt-4 flex items-center gap-3 sm:mt-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${course.referenceUploaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {course.referenceUploaded ? 'Reference Ready' : 'Awaiting Reference'}
                    </span>
                    <Link href={`/admin/course/${course.id}`} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                      Manage
                      <BookOpen className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Department summary</p>
                <h2 className="text-xl font-semibold text-gray-900">{selectedDepartment.name}</h2>
              </div>
              <div className="rounded-3xl bg-gray-100 px-4 py-2 text-sm text-gray-700">
                {selectedDepartment.courses.length} Courses
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total students in department</p>
                <p className="text-3xl font-semibold text-gray-900">{selectedDepartment.total_students}</p>
              </div>
              <div className="rounded-3xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Reference uploads complete</p>
                <p className="text-3xl font-semibold text-gray-900">{selectedDepartment.courses.filter((course) => course.referenceUploaded).length}</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
