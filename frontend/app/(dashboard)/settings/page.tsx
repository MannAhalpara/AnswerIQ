'use client';

import { useState } from 'react';
import { Save, X, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/Button';
import Link from 'next/link';

export default function SettingsPage() {
  // Removed current password field
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Removed showCurrent state
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requirements = [
    'At least 8 characters long',
    'Contains uppercase and lowercase letters',
    'Contains at least one number',
  ];

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setError('Password must contain both uppercase and lowercase letters');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch('http://localhost:8000/faculty/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update password');
      }

      setSuccess('Password updated successfully!');
      // setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account settings and preferences</p>
      </header>

      <div className="p-8 flex flex-col gap-6 max-w-2xl">
        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-400 mt-0.5 mb-5">Update your password to keep your account secure</p>

          <div className="flex flex-col gap-5">
            {/* Current password field removed */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
              <ul className="space-y-1">
                {requirements.map((req) => (
                  <li key={req} className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="md" disabled={loading}>
              <X className="w-4 h-4" /> Cancel
            </Button>
          </Link>
          <Button size="md" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
