'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ productId }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Produk ID ${productId}?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    // Ambil Token dari Local Storage (Ini adalah pola Client Component yang benar untuk otentikasi)
    const token = localStorage.getItem('admin_token');

    if (!token) {
        alert("Anda tidak terotentikasi. Silakan login kembali.");
        setIsDeleting(false);
        router.push('/login');
        return;
    }
    
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menghapus produk.');
      }

      alert(`Produk ID ${productId} berhasil dihapus.`);
      // Perintah penting di App Router: Memaksa Next.js untuk me-refresh Server Component
      router.refresh(); 
      
    } catch (error) {
      alert(`Error: ${error.message || 'Gagal menghapus.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-2"
    >
      {isDeleting ? 'Menghapus...' : 'Hapus'}
    </button>
  );
}