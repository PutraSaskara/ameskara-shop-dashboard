'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCategoryButton({ categoryId }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleDelete = async () => {
        const confirmDelete = confirm("Yakin ingin menghapus kategori ini? Produk yang menggunakan kategori ini akan kehilangan label kategorinya.");
        if (!confirmDelete) return;

        setIsDeleting(true);
        const token = localStorage.getItem('admin_token');

        try {
            const res = await fetch(`${API_URL}/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!res.ok) throw new Error("Gagal menghapus");

            alert("Kategori dihapus");
            router.refresh(); // Refresh halaman agar data hilang dari tabel
        } catch (error) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Hapus Kategori"
        >
            {isDeleting ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            )}
        </button>
    );
}