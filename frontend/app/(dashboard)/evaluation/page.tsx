'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, Save, ChevronLeft, ChevronRight, Check, Info, BarChart2, Loader2, Play } from 'lucide-react';
import Button from '@/components/Button';

// Wrapper for Suspense to handle useSearchParams safely
export default function EvaluationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <EvaluationContent />
    </Suspense>
  );
}

function EvaluationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId');
  const courseId = searchParams?.get('courseId');

  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  // Form states for current question
  const [currentMarks, setCurrentMarks] = useState<number>(0);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');

  useEffect(() => {
    if (!studentId || !courseId) return;

    const startSessionAndFetch = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        if (!token) {
          router.push('/faculty/login');
          return;
        }

        // 1. Start or get session
        const startRes = await fetch('http://localhost:8000/faculty/evaluation/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            course_id: courseId,
            student_id: studentId
          })
        });

        if (!startRes.ok) throw new Error('Failed to start session');
        const sessionData = await startRes.json();
        setSession(sessionData);

        // 2. Fetch session details and all answers/questions
        const detailsRes = await fetch(`http://localhost:8000/faculty/evaluation/session/${sessionData.session_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!detailsRes.ok) throw new Error('Failed to fetch session details');
        const fullData = await detailsRes.json();
        
        setData(fullData);
        setItems(fullData.items || []);
        
        if (fullData.items && fullData.items.length > 0) {
           setCurrentMarks(fullData.items[0].evaluation?.final_marks || 0);
           setCurrentFeedback(fullData.items[0].evaluation?.feedback || '');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load evaluation session');
      } finally {
        setLoading(false);
      }
    };

    startSessionAndFetch();
  }, [studentId, courseId, router]);

  // Handle switching between questions
  const switchIndex = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= items.length) return;
    
    // Save current evaluation draft if taking an action
    await saveCurrentDraft();

    setCurrentIndex(newIndex);
    const item = items[newIndex];
    if (item.evaluation) {
      setCurrentMarks(item.evaluation.final_marks || 0);
      setCurrentFeedback(item.evaluation.feedback || '');
    } else {
      setCurrentMarks(0);
      setCurrentFeedback('');
    }
  };

  const saveCurrentDraft = async (silent = true) => {
      const item = items[currentIndex];
      // Only save if it has been evaluated once!
      if (!item || !item.evaluation) return;
      
      if (!silent) setSavingMarks(true);
      try {
        const token = localStorage.getItem('facultyToken');
        const res = await fetch(`http://localhost:8000/faculty/evaluation/${item.evaluation.id}`, {
          method: 'PUT',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            final_marks: currentMarks,
            feedback: currentFeedback
          })
        });
        
        if (res.ok) {
           // Update local state copy
           const updated = [...items];
           updated[currentIndex].evaluation.final_marks = currentMarks;
           updated[currentIndex].evaluation.feedback = currentFeedback;
           setItems(updated);
           if (!silent) alert('Marks saved successfully!');
        }
      } catch(err) {
         console.error('Save draft error:', err);
         if (!silent) alert('Failed to save marks');
      } finally {
         if (!silent) setSavingMarks(false);
      }
  };

  const handleEvaluate = async () => {
      if (evaluating) return;
      const item = items[currentIndex];
      if (!item) return;

      setEvaluating(true);
      try {
          const token = localStorage.getItem('facultyToken');
          const res = await fetch(`http://localhost:8000/faculty/evaluation/run/${item.answer_id}`, {
             method: 'POST',
             headers: {
               'Authorization': `Bearer ${token}`
             }
          });

          if (!res.ok) throw new Error('Evaluation failed server side.');
          const evalRes = await res.json();
          
          const updated = [...items];
          updated[currentIndex].evaluation = evalRes.evaluation;
          setItems(updated);
          
          setCurrentMarks(evalRes.evaluation.final_marks);
          setCurrentFeedback(evalRes.evaluation.feedback);

      } catch (err) {
         console.error(err);
         alert('Failed to evaluate. Ensure python dependencies are available.');
      } finally {
         setEvaluating(false);
      }
  };

  const handleSaveEvaluation = async () => {
      if (saving) return;
      setSaving(true);
      await saveCurrentDraft();
      
      try {
          const token = localStorage.getItem('facultyToken');
          const res = await fetch(`http://localhost:8000/faculty/evaluation/session/${session.session_id}/complete`, {
              method: 'POST',
              headers: {
                 'Authorization': `Bearer ${token}`
              }
          });
          
          if (res.ok) {
              router.push('/dashboard');
          } else {
              alert('Failed to complete session');
          }
      } catch(err) {
          console.error(err);
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data || items.length === 0) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
           <p className="text-gray-500">No evaluated answers found.</p>
        </div>
     );
  }

  const d = data;
  const currentItem = items[currentIndex];
  const ev = currentItem.evaluation;
  
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">AnswerIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
               {d.faculty.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">{d.faculty.name}</span>
          </div>
        </div>
      </header>

      {/* Student info bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="flex gap-12">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Student Name</p>
            <p className="text-sm font-semibold text-gray-900">{d.student.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">USN Number</p>
            <p className="text-sm font-semibold text-gray-900">{d.student.usn}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Subject Name</p>
            <p className="text-sm font-semibold text-gray-900">{d.course.name}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-5">
        {/* Two-column: Reference + Student Answer */}
        <div className="grid grid-cols-2 gap-5">
          {/* Reference Answer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Reference Answer</h2>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{currentItem.question_number}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentItem.question_text}</p>
                <p className="text-xs text-gray-400 mt-0.5">Maximum Marks: {currentItem.max_marks}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">Model Answer</p>
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {currentItem.reference_answer}
            </div>
          </div>

          {/* Student Answer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Student Answer</h2>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{currentItem.question_number}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentItem.question_text}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
              {currentItem.student_answer}
            </div>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Evaluation Metrics</h2>
          </div>

          {!ev ? (
             <div className="flex flex-col items-center justify-center py-8">
                <Button onClick={handleEvaluate} disabled={evaluating} size="md">
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {evaluating ? "Evaluating..." : "Evaluate this answer"}
                </Button>
                <p className="text-xs text-gray-400 mt-3">Click to run AI pipeline (Concept Coverage, Keyword Matching, Semantic Verification).</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Marks Awarded */}
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col">
                <p className="text-xs text-gray-500 mb-3">Marks Awarded</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={currentMarks}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                           setCurrentMarks(Math.min(currentItem.max_marks, Math.max(0, val)));
                        } else {
                           setCurrentMarks(0);
                        }
                      }}
                      step="0.5"
                      className="w-20 h-14 border-2 border-gray-200 rounded-lg text-center text-2xl font-bold text-gray-900 shadow-inner focus:outline-none focus:border-gray-900 transition-colors"
                    />
                  </div>
                  <span className="text-xl text-gray-400">/ {currentItem.max_marks}</span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => saveCurrentDraft(false)}
                    disabled={savingMarks}
                    className="ml-auto"
                  >
                    {savingMarks ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Save Marks
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {['+1', '+0.5', '-0.5', '-1'].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                         const delta = parseFloat(v);
                         setCurrentMarks((m) => Math.min(currentItem.max_marks, Math.max(0, parseFloat((m + delta).toFixed(1)))));
                      }}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-medium">Tip: Use buttons or type marks manually. Click "Save Marks" to persist.</p>
              </div>

              {/* Content Analysis */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">Content Analysis Breakdown</p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                      <span className="text-sm text-gray-600">Concept Coverage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(ev.concept_score / currentItem.max_marks) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 text-sm w-8 text-right">{ev.concept_score?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                      <span className="text-sm text-gray-600">Keyword Matching</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${(ev.keywords_score / currentItem.max_marks) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 text-sm w-8 text-right">{ev.keywords_score?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                       <p className="text-[10px] text-gray-400 text-center italic">Advanced AI-driven semantic verification completed.</p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {ev && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-in fade-in zoom-in duration-300">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Feedback &amp; Comments</h2>
          <textarea
            value={currentFeedback}
            onChange={(e) => setCurrentFeedback(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
          />
        </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex gap-3">
           <span className="text-xs text-gray-500 flex items-center">
               Question {currentIndex + 1} of {items.length}
           </span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md" onClick={() => switchIndex(currentIndex - 1)} disabled={isFirst || evaluating}>
            <ChevronLeft className="w-4 h-4" /> Previous Answer
          </Button>
          
          {isLast ? (
             <Button size="md" onClick={handleSaveEvaluation} disabled={saving || evaluating}>
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
               Save Evaluation
             </Button>
          ) : (
             <Button variant="outline" size="md" onClick={() => switchIndex(currentIndex + 1)} disabled={evaluating}>
               Next Answer <ChevronRight className="w-4 h-4" />
             </Button>
          )}
        </div>
      </div>
    </div>
  );
}
