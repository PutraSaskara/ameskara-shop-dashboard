'use client';
// app/(dashboard)/articles/page.jsx
import Link from 'next/link';
import Image from 'next/image';
import Pagination from '../products/components/Pagination'; // Reuse pagination

// Helper untuk Badge Status
const getStatusBadge = (status) => {
    if (status === 'published') {
        return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper Fetch Data
async function getArticles(search = '', page = 1) {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_KEY = process.env.WEB_API_KEY; // Jika pakai middleware API Key
    // Atau ambil token dari cookie server-side jika pakai protect (Untuk server component agak tricky ambil token,
    // tapi karena ini dashboard yang dilindungi middleware di layout, kita asumsikan fetch client side atau 
    // untuk sementara kita pakai public fetch dulu jika backend mengizinkan, 
    // TAPI karena endpoint dashboard kita protect, kita butuh token).
    
    // CATATAN: Karena endpoint /dashboard diproteksi JWT, fetch di Server Component Next.js 
    // butuh meneruskan cookie/header. 
    // Agar simpel, kita gunakan Client Component fetch atau matikan protect sementara untuk tes.
    // TAPI: Cara paling aman dan cepat di sini adalah fetch CLIENT SIDE di dalam useEffect,
    // ATAU kita panggil endpoint public saja dulu (tapi status draft tidak muncul).
    
    // SOLUSI TERBAIK UNTUK DEMO: Gunakan endpoint Dashboard tapi kita perlu handling Token di Server Component.
    // Agar tidak rumit, kita gunakan endpoint /articles/dashboard tapi kita harus passing token.
    // Jika sulit, kita gunakan Client Component pattern. 
}

// --- VERSI CLIENT COMPONENT (Lebih mudah handle Token localStorage) ---
// Kita ubah file ini menjadi 'use client' agar bisa ambil token dari localStorage


import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || 1;

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('admin_token');
            const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

            try {
                // Panggil endpoint Dashboard yang baru kita buat
                const res = await fetch(`${API_URL}/articles/dashboard?page=${page}&search=${search}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.status === 401) {
                    router.push('/login');
                    return;
                }

                const data = await res.json();
                setArticles(data.data || []);
                setPagination(data.pagination || {});
            } catch (error) {
                console.error("Gagal ambil artikel:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [page, search, router]);

    // Fungsi Hapus Artikel
    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus artikel ini?')) return;
        
        const token = localStorage.getItem('admin_token');
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const res = await fetch(`${API_URL}/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Artikel dihapus');
                window.location.reload(); // Reload simpel
            }
        } catch (e) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Artikel Blog</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola konten dan berita ({pagination.totalItems || 0} post)</p>
                </div>
                <Link 
                    href="/articles/create" 
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <span className="text-lg leading-none">+</span> Tulis Artikel
                </Link>
            </div>

            {isLoading ? (
                <p>Memuat data...</p>
            ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 text-3xl">📝</div>
                    <h3 className="text-lg font-semibold text-gray-900">Belum ada artikel</h3>
                    <p className="text-gray-500 mt-2">Mulai menulis untuk meningkatkan SEO toko Anda.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase w-20">Cover</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Judul & Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="relative w-16 h-12 bg-gray-100 rounded overflow-hidden border">
                                                {article.thumbnail ? (
                                                    <Image src={article.thumbnail} alt="thumb" fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">{article.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{article.excerpt || 'Tidak ada ringkasan'}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">{new Date(article.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {article.category_name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded border capitalize ${getStatusBadge(article.status)}`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center gap-3">
                                                {/* Tombol Edit (Arahkan ke page edit yg nanti kita buat) */}
                                                <Link href={`/articles/edit/${article.id}`} className="text-blue-600 hover:text-blue-800">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>
                                                {/* Tombol Delete */}
                                                <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-700">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination (Opsional: Reuse komponen Pagination jika mau dipasang logic-nya) */}
                </div>
            )}
        </div>
    );
}