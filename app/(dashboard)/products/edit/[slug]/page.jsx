// app/(dashboard)/products/edit/[slug]/page.jsx

import ProductEditForm from '../components/ProductEditForm';
import { notFound } from 'next/navigation';

// Fungsi untuk mengambil data produk berdasarkan SLUG
async function getProductDetail(slug) {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_KEY = process.env.WEB_API_KEY; 

    console.log('data slug:', slug);

    // PENTING: Perkuat pengecekan slug
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        return null;
    }

    try {
        // --- PERUBAHAN DI SINI: Fetching menggunakan SLUG ---
        const res = await fetch(`${API_URL}/products/public/${slug}`, { 
            headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY || ''
            },
            cache: 'no-store' 
        });

        if (!res.ok) {
            console.error(`Gagal fetching produk SLUG ${slug}: Status ${res.status}`);
            return null;
        }

        const data = await res.json();
        
        if (typeof data.variants === 'string') {
            data.variants = JSON.parse(data.variants);
        }
        
        return data;

    } catch (error) {
        console.error("Error fetching detail produk:", error);
        return null;
    }
}


export default async function EditProductPage({ params }) {
    // --- PERUBAHAN DI SINI: Ambil SLUG dari params ---
    const { slug } = params; 
    
    // 1. Fetch data di Server Component
    const product = await getProductDetail(slug);

    if (!product) {
        notFound();
    }
    
    // 2. Meneruskan data ke Client Component. 
    // Kita meneruskan ID produk yang sebenarnya (product.id) untuk digunakan di PUT request
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Produk: {product.name}</h1>
            <ProductEditForm 
                initialData={product} 
                productId={product.id} // <-- Menggunakan ID yang didapat dari fetching
            />
        </div>
    );
}