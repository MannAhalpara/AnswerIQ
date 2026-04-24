'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, UploadCloud, User, Mail, Building } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import PDFUploadModal from '@/components/PDFUploadModal';
import { type Course } from '@/lib/mockData';

interface AdminCourseManagerProps {
  course: Course & { department: string };
}

export default function AdminCourseManager({ course }: AdminCourseManagerProps) {
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);

  const handleReferenceUpload = (file: File) => {
    console.log('Uploading reference file:', file.name);
    alert(`Reference file "${file.name}" uploaded successfully!`);
  };

  const handleStudentUpload = (file: File) => {
    if (selectedStudentId) {
      console.log('Uploading student file:', file.name, 'for student:', selectedStudentId);
      alert(`Student answer sheet "${file.name}" uploaded successfully!`);
    }
  };

  const openStudentModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setStudentModalOpen(true);
  };

  const selectedStudent = course.students.find((s) => s.id === selectedStudentId);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Course Management</p>
          <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Department: {course.department}</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to dashboard
        </Link>
      </header>

      <div className="p-8 space-y-6">
        <Card>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Assigned Faculty</p>
              <h2 className="text-xl font-semibold text-gray-900">{course.faculty.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              {course.faculty.designation}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{course.faculty.name}</p>
                <p className="text-xs text-gray-500">{course.faculty.designation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{course.faculty.email}</p>
                <p className="text-xs text-gray-500">Institutional Email</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Reference Answer Upload</p>
              <h2 className="text-xl font-semibold text-gray-900">Faculty Reference Document</h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${course.referenceUploaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
            >
              {course.referenceUploaded ? 'Uploaded' : 'Pending Upload'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {course.referenceUploaded ? (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Current file: {course.referenceFile}</span>
                </div>
              ) : (
                <span>No reference document uploaded yet</span>
              )}
            </div>
            <Button onClick={() => setReferenceModalOpen(true)}>
              {course.referenceUploaded ? 'Update Reference' : 'Upload Reference'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Student Management</p>
              <h2 className="text-xl font-semibold text-gray-900">Student Answer Sheets</h2>
            </div>
            <Button variant="outline" onClick={() => setShowStudentList(!showStudentList)}>
              {showStudentList ? 'Hide Student List' : 'Show Student List'}
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Total students: {course.students.length}</span>
            <span>Uploaded: {course.students.filter((s) => s.uploadStatus === 'Uploaded').length}</span>
          </div>

          {showStudentList && (
            <DataTable>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Name', 'USN', 'Status', 'Action'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {course.students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{student.usn}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${student.uploadStatus === 'Uploaded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {student.uploadStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" onClick={() => openStudentModal(student.id)}>
                        Upload Answer Sheet
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </Card>
      </div>

      <PDFUploadModal
        isOpen={referenceModalOpen}
        onClose={() => setReferenceModalOpen(false)}
        title="Upload Reference Answer"
        description="Upload the faculty reference answer document for this course. Only PDF files are accepted."
        onUpload={handleReferenceUpload}
        currentFile={course.referenceFile}
      />

      <PDFUploadModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false);
          setSelectedStudentId(null);
        }}
        title={`Upload Answer Sheet - ${selectedStudent?.name || ''}`}
        description={`Upload the answer sheet for ${selectedStudent?.name || 'student'}. Only PDF files are accepted.`}
        onUpload={handleStudentUpload}
        currentFile={selectedStudent?.uploadedFile}
      />
    </div>
  );
}
