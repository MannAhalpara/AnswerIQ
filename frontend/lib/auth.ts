'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const getToken = () => localStorage.getItem('adminToken');
  const getUser = () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  };

  return { logout, getToken, getUser };
}

export function useFacultyAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('facultyToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyUser');
    router.push('/login');
  };

  const getToken = () => localStorage.getItem('facultyToken');
  const getUser = () => {
    const user = localStorage.getItem('facultyUser');
    return user ? JSON.parse(user) : null;
  };

  return { logout, getToken, getUser };
}
