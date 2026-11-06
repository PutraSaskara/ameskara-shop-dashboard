'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      const redirectTo = searchParams.get('from') || '/products';
      router.replace(redirectTo);
    }
  }, [router, searchParams]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Menggunakan operator && untuk mencegah error jika data.message tidak ada
        throw new Error(data.message || 'Login gagal.');
      }

      const { token, role } = await res.json();
      
      // Simpan token dan role di Local Storage dan Cookie untuk Route Guard
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_role', role);
        document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
      
      const redirectTo = searchParams.get('from') || '/products';
      router.push(redirectTo); // Arahkan ke halaman tujuan setelah login
    } catch (err) {
      // Menangani error dengan lebih sederhana di JSX
      setError(err.message || 'Terjadi kesalahan tidak dikenal.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 text-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center">Dashboard Login</h1>
        
        {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <LoginForm />
    </Suspense>
  );
}