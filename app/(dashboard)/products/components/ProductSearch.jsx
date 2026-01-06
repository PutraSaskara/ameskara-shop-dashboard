'use client';

import { useState, useEffect } from 'react'; // Tambahkan useEffect
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State untuk input teks
  const [text, setText] = useState(searchParams.get('search') || '');

  // Update text state jika URL berubah (misal user klik "Clear Search")
  useEffect(() => {
    setText(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Ambil category yang sedang aktif (supaya tidak hilang saat search)
    const currentCategory = searchParams.get('category');
    
    const params = new URLSearchParams();

    // 1. Set Search
    if (text.trim()) {
      params.set('search', text);
    }

    // 2. Pertahankan Category jika ada
    if (currentCategory) {
      params.set('category', currentCategory);
    }

    // 3. Reset page ke 1
    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-64 text-black">
      <input
        type="text"
        placeholder="Cari produk..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </form>
  );
}