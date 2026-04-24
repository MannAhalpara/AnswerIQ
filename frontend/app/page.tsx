'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      title: "AI-Driven Evaluation",
      desc: "Beyond simple keyword matching. Our semantic NLP engine understands the context and quality of student responses."
    },
    {
      title: "Handwritten OCR",
      desc: "Powered by Gemini for high-fidelity text extraction from handwritten student scripts and scanned PDF sheets."
    },
    {
      title: "Automated Feedback",
      desc: "Instantly generate data-driven feedback and marks based on your specific model answers and grading rubric."
    },
    {
      title: "Scalable Workflow",
      desc: "Designed to handle massive volumes of answer sheets across departments with consistent accuracy and zero fatigue."
    }
  ];

  const steps = [
    { number: "01", title: "Upload", desc: "Upload your reference solution and student answer sheets." },
    { number: "02", title: "Digitize", desc: "Our OCR pipeline converts scanned image scripts into searchable, editable text." },
    { number: "03", title: "Analyze", desc: "AI compares semantic meaning against the model key to calculate similarity." },
    { number: "04", title: "Grade", desc: "Review the system-generated scores and feedback before finalized submission." }
  ];

  const faqs = [
    { q: "How accurate is the handwriting recognition?", a: "We utilize multi-modal Gemini models specifically trained to handle diverse handwriting styles and script orientations with high accuracy." },
    { q: "Can it evaluate different subjects?", a: "Yes, the semantic engine is subject-agnostic and relies on the model answer you provide to evaluate technical or theoretical accuracy." },
    { q: "Who manages the data?", a: "Admins have full control over course and department management, while faculty handle the evaluation and feedback directly." }
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-gray-900 selection:bg-gray-900 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-gray-900">AnswerIQ</span>
        </div>
        <div className="flex items-center gap-8 ml-auto">
          <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it helps</a>
          <a href="#help" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Help</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-8 md:px-16 pt-24 pb-32 grid lg:grid-cols-2 lg:gap-24 items-center max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200">
            Next-Gen Evaluation
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter">
            Smart Answer Evaluation <span className="italic text-gray-300">Powered by AI.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-md font-medium">
            Automating the comparison, similarity analysis, and marking of student answer sheets with precise semantic NLP.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/login" className="group px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-gray-300 transition-all active:scale-95 duration-300">
              Faculty Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/admin/login" className="px-8 py-4 border-2 border-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 duration-300">
              Admin Portal
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative mt-16 lg:mt-0">
          <div className="absolute -inset-4 bg-gradient-to-tr from-gray-100 to-transparent rounded-[3rem] blur-2xl opacity-50" />
          <div className="relative bg-white border border-gray-200 shadow-2xl rounded-[2.5rem] p-8 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-12 bg-gray-100 rounded-full" />
                <div className="h-4 w-24 bg-gray-50 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5 font-black text-xs">
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
                 95% MATCH
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full" />
                  <div className="h-2 w-5/6 bg-gray-100 rounded-full" />
                  <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center italic text-[10px] text-gray-400">Reference Text</div>
               </div>
               <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full" />
                  <div className="h-2 w-4/6 bg-gray-100 rounded-full" />
                  <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center italic text-[10px] text-gray-400">Student OCR Output</div>
               </div>
            </div>
            
            <div className="pt-4 flex justify-end">
               <div className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">Generated Score: 9/10</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="bg-white border-y border-gray-100 py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Core Capabilities</h2>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter max-w-lg mb-8 leading-tight">
              Designed to eliminate manual grading bias and fatigue.
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-[2rem] border border-gray-100 hover:border-gray-900 transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl font-black text-gray-100 mb-6 group-hover:text-gray-900 transition-colors duration-500">
                  {i + 1}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-24">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">The Workflow</h2>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Simple. Scientific. Scalable.</h3>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 relative">
             {/* Connector line */}
             <div className="hidden lg:block absolute top-[2.25rem] left-0 right-0 h-0.5 bg-gray-200 -z-0" />
             
             {steps.map((s, i) => (
                <div key={i} className="relative z-10 px-8 flex flex-col items-center text-center">
                   <div className="h-12 w-12 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center font-black text-xs text-gray-900 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                      {s.number}
                   </div>
                   <h4 className="text-lg font-bold text-gray-900 mb-2 italic">{s.title}</h4>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">{s.desc}</p>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* FAQ / Help */}
      <section id="help" className="py-32">
        <div className="max-w-3xl mx-auto px-8">
           <div className="mb-16">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Help Center</h2>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Frequently Asked Questions</h3>
           </div>
           
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                 <div key={i} className="rounded-3xl border border-gray-100 overflow-hidden">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                       <span className="font-bold text-gray-900">{faq.q}</span>
                       <HelpCircle className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === i && (
                       <div className="px-8 pb-6 text-sm text-gray-500 leading-relaxed font-medium">
                          {faq.a}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-24 text-center">
         <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-bold tracking-tight text-white">AnswerIQ</span>
         </div>
         <p className="text-gray-500 text-xs font-medium mb-8">© 2026 Admin Panel — Smart Evaluation for Future Educators.</p>
         <div className="flex items-center justify-center gap-6">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:support@answeriq.com" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Contact Support</a>
         </div>
      </footer>
    </div>
  );
}
