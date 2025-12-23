'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Pakai useParams untuk ambil ID
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

// Import Editor secara Dynamic
const Editor = dynamic(() => import('../../components/Editor'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg border"></div>
});

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams(); // Ambil ID dari URL
    const { id } = params; 
    
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        status: 'draft',
        thumbnailFile: null,
        thumbnailPreview: null,
        content: null, 
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [initialContent, setInitialContent] = useState(null); // State khusus untuk data awal editor

    // 1. Fetch Data Artikel saat halaman dimuat
    useEffect(() => {
        const fetchArticle = async () => {
            const token = localStorage.getItem('admin_token');
            try {
                const res = await fetch(`${API_URL}/articles/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Artikel tidak ditemukan');

                const json = await res.json();
                const data = json.data;

                setFormData({
                    title: data.title,
                    excerpt: data.excerpt || '',
                    status: data.status,
                    thumbnailPreview: data.thumbnail, // URL dari server
                    thumbnailFile: null,
                    content: data.content // Simpan konten untuk form state
                });

                // Set initial content untuk Editor.js
                // Penting: Editor.js butuh data awal hanya SEKALI saat render
                setInitialContent(data.content);

            } catch (error) {
                console.error(error);
                alert("Gagal memuat artikel");
                router.push('/articles');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchArticle();
    }, [id, API_URL, router]);

    // Handler Input Teks
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler Thumbnail
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                thumbnailFile: file,
                thumbnailPreview: URL.createObjectURL(file)
            });
        }
    };

    // Handler Editor Change
    const handleEditorChange = (data) => {
        setFormData(prev => ({ ...prev, content: data }));
    };

    // Handler Submit (UPDATE)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const token = localStorage.getItem('admin_token');
        const data = new FormData();
        
        data.append('title', formData.title);
        data.append('excerpt', formData.excerpt);
        data.append('status', formData.status);
        
        if (formData.content) {
            data.append('content', JSON.stringify(formData.content));
        }

        if (formData.thumbnailFile) {
            data.append('thumbnail', formData.thumbnailFile);
        }

        try {
            const res = await fetch(`${API_URL}/articles/${id}`, {
                method: 'PUT', // Gunakan PUT
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data
            });

            if (!res.ok) throw new Error('Gagal update artikel');

            alert('Artikel berhasil diperbarui!');
            router.refresh();
            router.push('/articles'); 

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Memuat data artikel...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Artikel</h1>
            <Link href="/articles" className="mb-6 inline-block text-indigo-600 hover:underline">&larr; Kembali</Link>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul & Status */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Judul Artikel</label>
                            <input type="text" name="title" required 
                                value={formData.title}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-lg font-semibold text-black"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="w-1/4">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Ringkasan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ringkasan</label>
                        <textarea name="excerpt" rows="2"
                            value={formData.excerpt}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-black"
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                        {formData.thumbnailPreview && (
                            <div className="relative h-40 w-full md:w-1/2 mb-2 mt-2 rounded overflow-hidden border">
                                <Image src={formData.thumbnailPreview} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} 
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700"
                        />
                    </div>
                </div>

                {/* AREA EDITOR.JS */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konten Artikel</label>
                    <div className="min-h-[400px]">
                        {/* Kita passing initialContent ke prop 'value' */}
                        <Editor 
                            holder="editorjs-edit-container" 
                            value={initialContent} 
                            onChange={handleEditorChange} 
                        />
                    </div>
                </div>

                <button type="submit" disabled={isSaving} 
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
}