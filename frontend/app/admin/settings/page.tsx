'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Database, 
  Globe, 
  Bell,
  Clock,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'academic', name: 'Academic', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System Status', icon: Activity },
  ];

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-gray-100 px-8 py-5">
        <div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">System Configuration</p>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id 
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-1' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {activeTab === 'general' && (
              <Card className="rounded-[2rem] border-gray-100 p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">General Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Basic identification settings for the AnswerIQ instance.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Institution Name</label>
                      <input 
                        type="text" 
                        defaultValue="AnswerIQ University"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Admin Email</label>
                      <input 
                        type="email" 
                        defaultValue="admin@answeriq.com"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                  </div>
                  <Button className="w-fit px-8 py-3 rounded-2xl">Save Changes</Button>
                </div>
              </Card>
            )}

            {activeTab === 'academic' && (
              <Card className="rounded-[2rem] border-gray-100 p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Academic Calendar</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure the current active semester and grading periods.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Current Semester</label>
                      <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition">
                        <option>Even Semester 2025-26</option>
                        <option>Odd Semester 2025-26</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Academic Year</label>
                      <input 
                        type="text" 
                        defaultValue="2025 - 2026"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] border-gray-100 p-8 flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Database</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-gray-500 font-medium">Supabase Connected</span>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 p-8 flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">AI Service</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-500 font-medium">Gemini API Online</span>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 p-8 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-2xl text-gray-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 italic">System Uptime</h4>
                        <p className="text-sm text-gray-500">Last incident reported: 3 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">99.9%</p>
                      <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Healthy</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
