'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  User, 
  Building,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  usn: string;
  uploadStatus: 'Uploaded' | 'Pending';
  avatarSeed: number;
}

interface CourseDetails {
  id: string;
  name: string;
  code: string;
  department: { id: string; name: string };
  faculty: { id: string; name: string; email: string };
  students: Student[];
  referenceUploaded: boolean;
}

interface JobStatus {
  status: string;
  message: string;
}

export default function CourseManagementPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState<string>('');
  
  // Job Tracking
  const [activeJob, setActiveJob] = useState<{ id: string; type: 'reference' | 'student'; studentId?: string } | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null); // Track specific section uploading
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/admin/course/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load admin ID from localStorage
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminUserStr) {
      try {
        const user = JSON.parse(adminUserStr);
        setAdminId(user.id);
      } catch (e) {
        console.error("Failed to parse adminUser:", e);
      }
    }
    fetchCourseDetails();
  }, [courseId]);

  // Polling for job status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeJob) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/admin/job-status/${activeJob.id}`);
          if (!response.ok) return;
          const data = await response.json();
          setJobStatus(data);

          if (data.status === 'Completed') {
            clearInterval(interval);
            fetchCourseDetails();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            setTimeout(() => {
              setActiveJob(null);
              setJobStatus(null);
            }, 3000);
          } else if (data.status === 'Failed') {
            clearInterval(interval);
            setTimeout(() => {
              setActiveJob(null);
              setJobStatus(null);
            }, 5000);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'student', studentId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', course.id);
    formData.append('department_id', course.department.id || '');
    formData.append('faculty_id', course.faculty.id || '');
    formData.append('admin_id', adminId || '00000000-0000-0000-0000-000000000000'); // Fallback to empty UUID if not found

    if (type === 'student' && studentId) {
      formData.append('student_id', studentId);
    }

    const endpoint = type === 'reference' ? 'reference' : 'answer';

    try {
      setUploadingId(studentId || 'reference');
      const response = await fetch(`http://localhost:8000/admin/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      // Clear input so the same file can be selected again
      e.target.value = '';

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setActiveJob({ id: data.job_id, type, studentId });
      setJobStatus({ status: 'Pending', message: 'Starting process...' });
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          <p className="text-gray-500 font-medium">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <Card className="max-w-md p-8 text-center mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Course not found'}</p>
          <Button onClick={() => router.push('/admin/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-12 relative overflow-hidden">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          >
             <div className="bg-green-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-green-500/20 backdrop-blur-md">
                <div className="bg-white/20 p-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                   <p className="text-sm font-bold">Uploading completed successfully!</p>
                   <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">AI Analysis complete</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Task Notification */}
      <AnimatePresence>
        {activeJob && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-80"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 overflow-hidden relative">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  jobStatus?.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                  jobStatus?.status === 'Failed' ? 'bg-red-50 text-red-600' : 
                  'bg-gray-100 text-gray-900'
                }`}>
                   {jobStatus?.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                   jobStatus?.status === 'Failed' ? <AlertCircle className="w-5 h-5" /> : 
                   <RefreshCw className="w-5 h-5 animate-spin" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeJob.type === 'reference' ? 'Processing Reference' : 'Processing Answer'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{jobStatus?.message || 'Processing...'}</p>
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: jobStatus?.status === 'Completed' ? '100%' : '60%' }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${jobStatus?.status === 'Completed' ? 'bg-green-500' : 'bg-gray-900'}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-5">
           <Link href="/admin/dashboard" className="p-2.5 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Course • {course.code}</p>
            <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Faculty</p>
             <p className="font-semibold text-gray-900">{course.faculty.name}</p>
           </div>
           <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-white shadow-sm">
             <User className="w-5 h-5" />
           </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Course Summary Cards */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm hover:border-gray-900 transition active:scale-[0.98] cursor-default">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Department</p>
              <h2 className="text-xl font-semibold text-gray-900">{course.department.name}</h2>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Total Students</p>
              <h2 className="text-xl font-semibold text-gray-900">{course.students.length}</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${course.referenceUploaded ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
               {course.referenceUploaded ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Reference Uploaded</p>
              <h2 className={`text-xl font-semibold ${
                activeJob?.type === 'reference' && jobStatus?.status !== 'Completed' ? 'text-blue-600' :
                course.referenceUploaded ? 'text-green-600' : 'text-orange-600'
              }`}>
                {activeJob?.type === 'reference' && jobStatus?.status !== 'Completed' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> AI Processing...
                  </span>
                ) : course.referenceUploaded ? 'Complete' : 'Pending'}
              </h2>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
          {/* Upload Card */}
          <Card className="rounded-[2.5rem] p-8 border-gray-100">
            <div className="flex items-center gap-3 mb-8">
               <FileText className="w-5 h-5 text-gray-400" />
               <h2 className="text-xl font-semibold text-gray-900 text-lg">Course Reference</h2>
            </div>

            <div className="relative group">
              <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 flex flex-col items-center gap-5 group-hover:border-gray-900 group-hover:bg-white transition-all duration-300">
                <div className="h-16 w-16 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white group-hover:scale-105 transition-all duration-300">
                   {(uploadingId === 'reference' || activeJob?.type === 'reference') ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-sm">
                    {(uploadingId === 'reference' || activeJob?.type === 'reference') ? 'AI is analyzing...' : 
                     course.referenceUploaded ? 'Reference Ready' : 'Upload Reference PDF'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 max-w-[200px] leading-relaxed">
                    {activeJob?.type === 'reference' ? jobStatus?.message : 
                     course.referenceUploaded ? 'PDF already processed. You can re-upload to overwrite.' : 'Select the official answer key for this examination.'}
                  </p>
                </div>
                <input 
                  type="file" 
                  id="ref-upload" 
                  className="hidden" 
                  accept=".pdf"
                  disabled={!!uploadingId || !!activeJob}
                  onChange={(e) => handleFileUpload(e, 'reference')}
                />
                <label 
                  htmlFor="ref-upload"
                  className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-gray-200 ${
                    (uploadingId || activeJob) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white cursor-pointer hover:bg-gray-700 active:scale-95'
                  }`}
                >
                  {(uploadingId === 'reference' || activeJob?.type === 'reference') ? 'Processing...' : 
                   course.referenceUploaded ? 'Re-upload PDF' : 'Choose File'}
                </label>
              </div>
            </div>
          </Card>

          {/* Student Management */}
          <Card className="rounded-[2.5rem] p-0 overflow-hidden border-gray-100">
            <div className="p-8 flex items-center justify-between border-b border-gray-50">
               <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 text-lg">Classroom ({course.students.length})</h2>
               </div>
               <div className="rounded-2xl bg-gray-50 px-4 py-2 border border-gray-100">
                  <input 
                    type="text" 
                    placeholder="Search by USN..." 
                    className="bg-transparent text-sm text-gray-600 focus:outline-none w-32 placeholder:text-gray-400 font-medium" 
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Student Information</th>
                    <th className="px-8 py-5">USN ID</th>
                    <th className="px-8 py-5 text-center">Cloud Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {course.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
                              {student.name.charAt(0)}
                           </div>
                           <span className="font-semibold text-gray-900">{student.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold bg-gray-50 text-gray-500 px-2.5 py-1.5 rounded-xl border border-white shadow-sm">
                          {student.usn}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-sm ${
                          activeJob?.studentId === student.id && jobStatus?.status !== 'Completed'
                            ? 'bg-blue-50 text-blue-700'
                            : student.uploadStatus === 'Uploaded' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                           <div className={`h-1.5 w-1.5 rounded-full ${
                             activeJob?.studentId === student.id && jobStatus?.status !== 'Completed' ? 'bg-blue-600 animate-spin' :
                             student.uploadStatus === 'Uploaded' ? 'bg-green-600 animate-pulse' : 'bg-orange-600'
                           }`} />
                           {activeJob?.studentId === student.id && jobStatus?.status !== 'Completed' ? 'Processing...' : student.uploadStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <input 
                           type="file" 
                           id={`student-${student.id}`} 
                           className="hidden" 
                           accept=".pdf"
                           disabled={!!uploadingId || !!activeJob}
                           onChange={(e) => handleFileUpload(e, 'student', student.id)}
                         />
                         <label 
                           htmlFor={`student-${student.id}`}
                           className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition duration-300 shadow-sm ${
                             (uploadingId || activeJob) ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border border-gray-900 text-gray-900 cursor-pointer hover:bg-gray-900 hover:text-white active:scale-95'
                           }`}
                         >
                            {(uploadingId === student.id || activeJob?.studentId === student.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {(uploadingId === student.id || activeJob?.studentId === student.id) ? 'Analyzing...' : 
                             student.uploadStatus === 'Uploaded' ? 'Re-upload PDF' : 'Upload PDF'}
                         </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
