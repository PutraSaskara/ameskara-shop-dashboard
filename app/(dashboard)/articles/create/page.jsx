'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Penting untuk Editor.js di Next.js
import Link from 'next/link';

// Import Editor secara Dynamic (SSR False) karena Editor.js butuh object 'window'
const Editor = dynamic(() => import('../components/Editor'), { 
  ssr: false,
  loading: () => <p className="p-4 text-gray-500">Memuat Editor...</p>
});

export default function CreateArticlePage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        thumbnailFile: null,
        thumbnailPreview: null,
        content: null, // Ini akan berisi JSON dari Editor.js
    });
    
    const [isLoading, setIsLoading] = useState(false);

    // Handler Input Teks Biasa
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

    // Handler Perubahan di Editor.js
    const handleEditorChange = (data) => {
        setFormData(prev => ({ ...prev, content: data }));
    };

    // Handler Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('excerpt', formData.excerpt);
        
        // Kirim konten editor sebagai string JSON
        if (formData.content) {
            data.append('content', JSON.stringify(formData.content));
        }

        if (formData.thumbnailFile) {
            data.append('thumbnail', formData.thumbnailFile);
        }

        data.append('status', 'published'); // Atau buat dropdown draft/published

        try {
            const res = await fetch(`${API_URL}/articles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data
            });

            if (!res.ok) throw new Error('Gagal membuat artikel');

            alert('Artikel berhasil diterbitkan!');
            router.push('/articles'); 

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto text-black">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Tulis Artikel Baru</h1>
            <Link href="/articles" className="mb-6 inline-block text-indigo-600 hover:underline">&larr; Kembali</Link>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Artikel</label>
                        <input type="text" name="title" required 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-lg font-semibold"
                            placeholder="Judul yang menarik..."
                            onChange={handleChange}
                        />
                    </div>

                    {/* Ringkasan (Excerpt) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ringkasan (Excerpt)</label>
                        <textarea name="excerpt" rows="2"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            placeholder="Deskripsi singkat untuk kartu artikel..."
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thumbnail Utama</label>
                        {formData.thumbnailPreview && (
                            <img src={formData.thumbnailPreview} alt="Preview" className="h-40 w-auto object-cover rounded mb-2 mt-2" />
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
                        <Editor 
                            holder="editorjs-container" 
                            onChange={handleEditorChange} 
                        />
                    </div>
                </div>

                <button type="submit" disabled={isLoading} 
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400">
                    {isLoading ? 'Menerbitkan...' : 'Terbitkan Artikel'}
                </button>
            </form>
        </div>
    );
}