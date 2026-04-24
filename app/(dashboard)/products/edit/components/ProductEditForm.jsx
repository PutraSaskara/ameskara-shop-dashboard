'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Struktur Sub-varian (Ukuran)
const initialSubVariant = {
    size: '',
    stock: 0,
    price: '',
};

// Struktur Varian Utama (Warna, Gambar, dan array Ukuran)
const initialVariant = {
    color: '',
    image: null, 
    imageFile: null, 
    isNewImage: false, 
    previewUrl: null, 
    sizes: [{ ...initialSubVariant }], 
};

export default function ProductEditForm({ initialData, productId }) {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Inisialisasi state form dengan data yang diterima dari Server Component
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        slug: initialData.slug || '',
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        
        // --- ADDED: Category ID ---
        // Jika null/undefined, set ke string kosong agar select terkontrol
        category_id: initialData.category_id || '', 
        // --------------------------

        // --- STATE UNTUK BANNER ---
        bannerImageUrl: initialData.banner_image || null, 
        bannerImageFile: null, 
        bannerPreviewUrl: null, 
        
        // MAPPING VARIAN
        variants: initialData.variants && initialData.variants.length > 0 ? 
            initialData.variants.map(v => ({
                ...v,
                image: v.image || null,
                imageFile: null,
                isNewImage: false,
                previewUrl: null,
                sizes: (v.sizes || [{ ...initialSubVariant }]).map(s => ({
                    ...s,
                    price: s.price || '',
                })) 
            })) 
            : [{ ...initialVariant }], 
    });
    
    // --- ADDED: State Categories ---
    const [categories, setCategories] = useState([]);
    // -------------------------------

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [missingFields, setMissingFields] = useState([]); // State untuk field yang error

    // --- ADDED: Fetch Categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, [API_URL]);
    // -------------------------------

    // --- HANDLER UTAMA ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // --- HANDLER BANNER UTAMA ---
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                bannerImageFile: file,
                bannerPreviewUrl: URL.createObjectURL(file), 
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                bannerImageFile: null,
                bannerPreviewUrl: null,
            }));
        }
    };

    // --- HANDLER VARIAN UTAMA (Warna & Gambar) ---
    const handleVariantChange = (index, e) => {
        const { name, value, files } = e.target;
        
        const newVariants = formData.variants.map((variant, i) => {
            if (i === index) {
                if (name === 'imageFile' && files && files.length > 0) {
                    const file = files[0];
                    return { 
                        ...variant, 
                        imageFile: file, 
                        isNewImage: true, 
                        previewUrl: URL.createObjectURL(file) 
                    };
                }
                if (name === 'color') {
                    return { ...variant, [name]: value };
                }
            }
            return variant;
        });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { ...initialVariant }],
        }));
    };

    const removeVariant = (index) => {
        if (formData.variants.length > 1) {
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index),
            }));
        }
    };
    
    // --- HANDLER SUB-VARIAN (Ukuran & Stok) ---
    const handleSubVariantChange = (variantIndex, subVariantIndex, e) => {
        const { name, value } = e.target;
        
        const newVariants = formData.variants.map((variant, i) => {
            if (i === variantIndex) {
                const newSizes = variant.sizes.map((size, j) => {
                    if (j === subVariantIndex) {
                        return { ...size, [name]: value };
                    }
                    return size;
                });
                return { ...variant, sizes: newSizes };
            }
            return variant;
        });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addSubVariant = (variantIndex) => {
        const newVariants = formData.variants.map((variant, i) => {
            if (i === variantIndex) {
                return { 
                    ...variant, 
                    sizes: [...variant.sizes, { ...initialSubVariant }] 
                };
            }
            return variant;
        });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeSubVariant = (variantIndex, subVariantIndex) => {
        const newVariants = formData.variants.map((variant, i) => {
            if (i === variantIndex) {
                if (variant.sizes.length > 1) {
                    return { 
                        ...variant, 
                        sizes: variant.sizes.filter((_, j) => j !== subVariantIndex) 
                    };
                }
            }
            return variant;
        });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };


    // --- HANDLER SUBMIT UTAMA (PUT) ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const token = localStorage.getItem('admin_token');
        if (!token) {
            setError('Sesi kedaluwarsa. Silakan login kembali.');
            router.push('/login');
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('slug', formData.slug); 
        data.append('meta_title', formData.meta_title);
        data.append('meta_description', formData.meta_description);
        
        // --- ADDED: Append Category ID ---
        if (formData.category_id) {
            data.append('category_id', formData.category_id);
        }
        // --------------------------------

        // --- Proses File Banner Utama ---
        if (formData.bannerImageFile) {
            data.append('productBanner', formData.bannerImageFile, formData.bannerImageFile.name);
        } else {
            data.append('banner_image_url_keep', formData.bannerImageUrl || 'DELETE'); 
        }

        // --- Proses Varian & Gambar ---
        const variantsPayload = [];
        formData.variants.forEach((variant) => {
            
            if (variant.isNewImage && variant.imageFile) {
                data.append('variantImages', variant.imageFile, variant.imageFile.name);
            }
            
            variantsPayload.push({
                color: variant.color,
                isNewImage: variant.isNewImage, 
                image: variant.image && !variant.isNewImage ? variant.image : null,
                sizes: variant.sizes.map(s => ({
                    size: s.size,
                    stock: Number(s.stock),
                    price: s.price ? Number(s.price) : undefined,
                })),
            });
        });

        data.append('variants', JSON.stringify(variantsPayload));

        // 3. Kirim Request PUT
        try {
            const res = await fetch(`${API_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data, 
            });

            const result = await res.json();

            if (!res.ok) {
                if (result.missingFields) {
                    setMissingFields(result.missingFields);
                }
                throw new Error(result.message || 'Gagal mengupdate produk.');
            }

            toast.success('Produk berhasil diupdate!');
            router.refresh();
            router.push('/products'); 

        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat koneksi server.');
            toast.error(err.message || 'Terjadi kesalahan server');
        } finally {
            setIsLoading(false);
        }
    };
    
    // CLEANUP URL lokal
    useEffect(() => {
        return () => {
            formData.variants.forEach(v => {
                if (v.previewUrl) {
                    URL.revokeObjectURL(v.previewUrl);
                }
            });
            if (formData.bannerPreviewUrl) {
                 URL.revokeObjectURL(formData.bannerPreviewUrl);
            }
        };
    }, [formData.variants, formData.bannerPreviewUrl]);


    // --- TAMPILAN FORM ---

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
            <Link href="/products" className="mb-4 inline-block text-indigo-600 hover:text-indigo-800">
                &larr; Kembali
            </Link>
            
            {error && (
                <div className="flex items-start p-4 mb-6 text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
                    <svg className="flex-shrink-0 w-5 h-5 mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                    <div className="ml-3 text-sm font-medium flex-1">
                        <span className="block font-bold mb-1">Gagal Mengupdate Data</span>
                        {error}
                    </div>
                    <button type="button" onClick={() => setError(null)} className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 transition-colors" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* --- BAGIAN DATA UTAMA --- */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold mb-3">Data Produk Utama</h2>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required
                        className={`mt-1 block w-full border ${missingFields.includes('name') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm p-2 transition-colors`} 
                    />
                    {missingFields.includes('name') && <p className="text-xs text-red-500 mt-1">Nama produk wajib diisi.</p>}
                </div>

                {/* --- ADDED: Input Kategori --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori Produk</label>
                    <select 
                        name="category_id" 
                        value={formData.category_id} 
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* ----------------------------- */}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug *</label>
                    <input 
                        type="text" 
                        name="slug" 
                        value={formData.slug} 
                        onChange={handleChange} 
                        required
                        className={`mt-1 block w-full border ${missingFields.includes('slug') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm p-2 transition-colors`} 
                    />
                    {missingFields.includes('slug') && <p className="text-xs text-red-500 mt-1">Slug/URL wajib diisi.</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Harga (Rp) *</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            required
                            className={`mt-1 block w-full border ${missingFields.includes('price') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm p-2 transition-colors`} 
                        />
                        {missingFields.includes('price') && <p className="text-xs text-red-500 mt-1">Harga wajib diisi.</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                {/* SEO Data */}
                <h3 className="text-lg font-semibold mt-6">SEO Data</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows="2"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
            </div>

            {/* --- BAGIAN BANNER UTAMA --- */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold mb-3">Gambar Banner Utama</h2>
                
                {(formData.bannerPreviewUrl || formData.bannerImageUrl) && (
                    <div className="relative w-full h-40 mb-3 border rounded-md overflow-hidden bg-gray-100">
                        <img 
                            src={formData.bannerPreviewUrl || formData.bannerImageUrl} 
                            alt="Pratinjau Banner" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pilih/Ganti Gambar Banner (.webp max 2MB)</label>
                    <input 
                        type="file" 
                        name="productBanner" 
                        accept=".webp" 
                        onChange={handleBannerChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                    />
                    {formData.bannerImageFile && (
                        <p className="text-xs text-orange-600 mt-1">File baru terpilih dan akan menggantikan yang lama.</p>
                    )}
                </div>
            </div>


            {/* --- BAGIAN VARIAN --- */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Varian Produk (Warna & Ukuran)</h2>
                
                {formData.variants.map((variant, index) => (
                    <div key={index} className="border border-indigo-200 bg-indigo-50 p-6 rounded-lg mb-6 relative">
                        <h3 className="text-xl font-bold mb-3 text-indigo-800">Warna Varian #{index + 1}</h3>
                        
                        {formData.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(index)}
                                className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-semibold text-sm">
                                Hapus Warna
                            </button>
                        )}

                        {/* Field Warna */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Warna (Contoh: Merah, Hitam) *</label>
                            <input type="text" name="color" value={variant.color} 
                                onChange={(e) => handleVariantChange(index, e)} required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>

                        {/* Input Gambar Varian Warna */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Ganti Gambar (.webp max 2MB)</label>
                            
                            {(variant.image || variant.previewUrl) && (
                                <div className="relative w-20 h-20 mb-2 border rounded-md overflow-hidden">
                                    <Image 
                                        src={variant.previewUrl || variant.image} 
                                        alt={`Varian ${index + 1}`} 
                                        fill 
                                        style={{objectFit: "cover"}}
                                        className="rounded"
                                    />
                                </div>
                            )}

                            <input type="file" name="imageFile" accept=".webp" 
                                onChange={(e) => handleVariantChange(index, e)}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            {(variant.imageFile) && (
                                <p className="text-xs text-orange-600 mt-1">File baru terpilih dan akan menggantikan gambar lama.</p>
                            )}
                        </div>
                        
                        {/* --- LOOP SUB-VARIAN (UKURAN & STOK) --- */}
                        <h4 className="text-lg font-semibold mt-6 mb-3 border-t pt-4">Daftar Ukuran ({variant.color || 'Baru'})</h4>
                        
                        {variant.sizes.map((subVariant, j) => (
                            <div key={j} className="flex space-x-4 mb-3 items-center bg-white p-3 rounded-md border">
                                
                                {/* Field Ukuran */}
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Ukuran (S, M, L) *</label>
                                    <input type="text" name="size" value={subVariant.size} 
                                        onChange={(e) => handleSubVariantChange(index, j, e)} required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                </div>
                                
                                {/* Field Stok */}
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Stok Ukuran *</label>
                                    <input type="number" name="stock" value={subVariant.stock} 
                                        onChange={(e) => handleSubVariantChange(index, j, e)} required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                </div>

                                {/* Field Harga */}
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Harga (Opsional)</label>
                                    <input type="number" name="price" value={subVariant.price} 
                                        onChange={(e) => handleSubVariantChange(index, j, e)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                </div>

                                {/* Hapus Sub-Varian */}
                                {variant.sizes.length > 1 && (
                                    <button type="button" onClick={() => removeSubVariant(index, j)}
                                        className="mt-4 text-red-500 hover:text-red-700 flex-shrink-0">
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        <button type="button" onClick={() => addSubVariant(index)}
                            className="mt-3 px-3 py-1 text-sm border border-dashed border-green-400 text-green-600 rounded-md hover:bg-green-50">
                            + Tambah Ukuran
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addVariant}
                    className={`mt-6 px-4 py-2 border border-dashed ${missingFields.includes('variants') ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-400 text-gray-600'} rounded-md w-full hover:bg-gray-50 transition-colors`}>
                    + Tambah Varian Warna Lain
                </button>
                {missingFields.includes('variants') && <p className="text-xs text-red-500 mt-2 text-center">Minimal harus ada satu varian produk.</p>}
            </div>

            {/* --- TOMBOL SUBMIT --- */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-md text-white font-semibold transition ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                {isLoading ? 'Mengupdate Produk...' : 'Update Produk'}
            </button>
        </form>
    );
}