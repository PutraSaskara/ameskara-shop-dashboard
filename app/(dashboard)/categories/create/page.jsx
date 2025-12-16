// app/(dashboard)/categories/create/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCategoryPage() {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Helper sederhana untuk preview slug (hanya visual)
    const generateSlugPreview = (text) => {
        return text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Gagal membuat kategori');
            }

            alert('Kategori berhasil dibuat!');
            
            // Redirect kembali ke halaman list kategori (kita akan buat setelah ini)
            // Atau jika belum ada, bisa ke dashboard utama
            router.push('/categories'); 
            router.refresh();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Buat Kategori Baru</h1>
            
            <div className="mb-6">
                 <Link href="/categories" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Kembali ke Daftar Kategori
                </Link>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Input Nama Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Baju Kaos, Sepatu Lari"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                        />
                        {/* Preview Slug */}
                        {name && (
                            <p className="mt-2 text-xs text-gray-500">
                                Slug otomatis: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                                    {generateSlugPreview(name)}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Tombol Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                                ${isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : (
                                'Simpan Kategori'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}