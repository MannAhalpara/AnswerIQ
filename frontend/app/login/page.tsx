'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Removed terms agreement check

    setLoading(true);

    try {
      // Check if backend is running
      const healthCheck = await fetch('http://localhost:8000/health', {
        method: 'GET',
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        setError('Backend server is not running. Make sure to start the backend at http://localhost:8000');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/faculty/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('facultyToken', data.token);
      localStorage.setItem('facultyUser', JSON.stringify(data.user));

      // Redirect to faculty dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Make sure the backend is running at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-start justify-center pt-16">
      <div className="w-full max-w-[500px] px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">LogIn to Your Account</h1>
          <p className="text-sm text-gray-400 mt-1">AnswerIQ</p>
        </div>

        <div className="flex flex-col gap-5 mt-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              disabled={loading}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1.5 ml-1">Use your institutional email address</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Enter Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                disabled={loading}
                className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Terms agreement removed */}

          {/* Submit */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
