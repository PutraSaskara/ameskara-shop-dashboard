'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch existing category data
    useEffect(() => {
        const fetchCategory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
                if (!res.ok) {
                    throw new Error('Gagal mengambil data kategori');
                }

                const categories = await res.json();
                const currentCategory = categories.find((cat) => String(cat.id) === String(id));

                if (!currentCategory) {
                    throw new Error('Kategori tidak ditemukan');
                }

                setFormData({
                    name: currentCategory.name || '',
                    slug: currentCategory.slug || '',
                    description: currentCategory.description || '',
                    meta_title: currentCategory.meta_title || '',
                    meta_description: currentCategory.meta_description || '',
                });
            } catch (err) {
                console.error('Error fetching category:', err);
                setError(err.message || 'Gagal memuat kategori');
                toast.error(err.message || 'Gagal memuat kategori');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCategory();
        }
    }, [id, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        if (!token) {
            toast.error('Sesi login telah berakhir');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug || undefined,
                    description: formData.description || null,
                    meta_title: formData.meta_title || null,
                    meta_description: formData.meta_description || null,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Gagal memperbarui kategori');
            }

            toast.success('Kategori berhasil diperbarui!');
            router.push('/categories');
            router.refresh();
        } catch (err) {
            console.error('Error updating category:', err);
            setError(err.message);
            toast.error(err.message || 'Terjadi kesalahan saat menyimpan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-16 text-center max-w-2xl mx-auto">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-500">Memuat data kategori...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Kategori</h1>

            <div className="mb-6">
                <Link href="/categories" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Kembali ke Daftar Kategori
                </Link>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input Nama Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Baju Kaos, Sepatu Lari"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                        />
                    </div>

                    {/* Input Slug Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug URL
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="contoh-nama-kategori"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Identifier unik yang digunakan pada link URL produk / katalog.
                        </p>
                    </div>

                    {/* Input Deskripsi Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi Kategori
                        </label>
                        <textarea
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Deskripsi singkat mengenai jenis produk dalam kategori ini..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Deskripsi kategori untuk katalog dan informasi pelanggan.
                        </p>
                    </div>

                    {/* Section SEO Kategori */}
                    <div className="border-t border-gray-100 pt-5 space-y-4">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span>🔍</span> Pengaturan SEO Kategori
                        </h2>

                        {/* Meta Title */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Meta Title (Judul Halaman di Google)
                                </label>
                                <span
                                    className={`text-xs ${
                                        (formData.meta_title || '').length > 60
                                            ? 'text-red-500 font-bold'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    {(formData.meta_title || '').length} / 60 karakter
                                </span>
                            </div>
                            <input
                                type="text"
                                name="meta_title"
                                value={formData.meta_title}
                                onChange={handleChange}
                                placeholder="Contoh: Koleksi Sprei Katun Bali Mewah | Ameskara"
                                maxLength={60}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Judul spesifik untuk halaman kategori di hasil pencarian Google.
                            </p>
                        </div>

                        {/* Meta Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Meta Description (Deskripsi di Google)
                                </label>
                                <span
                                    className={`text-xs ${
                                        (formData.meta_description || '').length > 160
                                            ? 'text-red-500 font-bold'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    {(formData.meta_description || '').length} / 160 karakter
                                </span>
                            </div>
                            <textarea
                                rows={3}
                                name="meta_description"
                                value={formData.meta_description}
                                onChange={handleChange}
                                placeholder="Deskripsikan koleksi kategori ini secara menarik untuk pengunjung hasil pencarian Google..."
                                maxLength={160}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Ringkasan maksimal 160 karakter yang ditampilkan di bawah judul di Google.
                            </p>
                        </div>
                    </div>

                    {/* Tombol Submit */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Link
                            href="/categories"
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                                ${
                                    isSaving
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
