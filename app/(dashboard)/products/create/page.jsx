'use client';

import { useState, useEffect } from 'react'; // Pastikan useEffect diimport
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Struktur Sub-varian (Ukuran)
const initialSubVariant = {
    size: '',
    stock: 0,
};

// Struktur Varian Utama (Warna, Gambar, dan array Ukuran)
const initialVariant = {
    color: '',
    imageFile: null, 
    previewUrl: null, 
    sizes: [{ ...initialSubVariant }], 
};

export default function CreateProductPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        // --- ADDED: State Category ID ---
        category_id: '', 
        // --------------------------------
        bannerImageFile: null, 
        bannerPreviewUrl: null,
        variants: [{ ...initialVariant }], 
    });

    // --- ADDED: State untuk menyimpan list kategori dari API ---
    const [categories, setCategories] = useState([]);
    // ----------------------------------------------------------

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // --- ADDED: Fetch Categories saat Component Mount ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                } else {
                    console.error("Gagal mengambil data kategori");
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, [API_URL]);
    // ----------------------------------------------------

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


    // --- HANDLER SUBMIT UTAMA ---

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
        
        // --- Append field teks ---
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        if (formData.slug) data.append('slug', formData.slug); 
        data.append('meta_title', formData.meta_title);
        data.append('meta_description', formData.meta_description);

        // --- ADDED: Append Category ID ---
        if (formData.category_id) {
            data.append('category_id', formData.category_id);
        }
        // --------------------------------

        // --- Append File Banner Utama ---
        if (formData.bannerImageFile) {
            data.append('productBanner', formData.bannerImageFile, formData.bannerImageFile.name);
        }

        // --- Proses Varian & Gambar ---
        const variantsPayload = [];
        formData.variants.forEach((variant) => {
            if (variant.imageFile) {
                data.append('variantImages', variant.imageFile, variant.imageFile.name);
            }

            variantsPayload.push({
                color: variant.color,
                sizes: variant.sizes.map(s => ({
                    size: s.size,
                    stock: Number(s.stock),
                })),
            });
        });

        data.append('variants', JSON.stringify(variantsPayload));

        // 2. Kirim Request
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data, 
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Gagal menambahkan produk.');
            }

            alert('Produk berhasil ditambahkan!');
            router.refresh();
            router.push('/products'); 

        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat koneksi server.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- CLEANUP URL lokal ---
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


    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Tambah Produk Baru</h1>
            <Link href="/products" className="mb-4 inline-block text-indigo-600 hover:text-indigo-800">
                &larr; Kembali ke Daftar Produk
            </Link>

            <form onSubmit={handleSubmit} className="space-y-6 text-black">
                
                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                {/* --- BAGIAN DATA UTAMA --- */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 className="text-xl font-semibold mb-3">Data Produk Utama</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
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
                        <p className="text-xs text-gray-500 mt-1">
                            Belum ada kategori? <Link href="/categories" className="text-indigo-600 hover:underline">Buat di sini</Link>
                        </p>
                    </div>
                    {/* ----------------------------- */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug (Opsional, diisi otomatis jika kosong)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Harga (Rp) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
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
                    
                    {formData.bannerPreviewUrl && (
                        <div className="relative w-full h-40 mb-3 border rounded-md overflow-hidden bg-gray-100">
                            <img 
                                src={formData.bannerPreviewUrl} 
                                alt="Pratinjau Banner" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pilih Gambar Banner (.webp max 2MB) *</label>
                        <input 
                            type="file" 
                            name="productBanner" 
                            accept=".webp" 
                            required 
                            onChange={handleBannerChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                        />
                        {formData.bannerImageFile && (
                            <p className="text-xs text-green-600 mt-1">File terpilih: {formData.bannerImageFile.name}</p>
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
                                <label className="block text-sm font-medium text-gray-700">Gambar Varian (.webp max 2MB) *</label>
                                
                                {/* --- PRATINJAU GAMBAR --- */}
                                {(variant.previewUrl) && (
                                    <div className="relative w-20 h-20 mb-2 border rounded-md overflow-hidden">
                                        <img 
                                            src={variant.previewUrl} 
                                            alt={`Pratinjau ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <input type="file" name="imageFile" accept=".webp" required={!variant.imageFile}
                                    onChange={(e) => handleVariantChange(index, e)}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                {variant.imageFile && (
                                    <p className="text-xs text-green-600 mt-1">File terpilih: {variant.imageFile.name}</p>
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
                        className="mt-6 px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-md w-full hover:bg-gray-50">
                        + Tambah Varian Warna Lain
                    </button>
                </div>

                {/* --- TOMBOL SUBMIT --- */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-md text-white font-semibold transition ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isLoading ? 'Menyimpan Produk...' : 'Simpan Produk'}
                </button>
            </form>
        </div>
    );
}