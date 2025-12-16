import { notFound } from 'next/navigation';
import ProductDetailClient from '../components/ProductDetailClient';

// Fungsi Fetching Data (Server Side)
async function getProductBySlug(slug) {
    const API_KEY = process.env.WEB_API_KEY; 
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    try {
        const res = await fetch(`${API_URL}/products/public/${slug}`, {
             method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY || '' 
      },
      cache: 'no-store' 
    });
        console.log('Fetch product by slug:', slug, 'Status:', res.status);

        if (!res.ok) return null;

        const product = await res.json();
        
        // Parsing variants jika masih string (double check)
        if (typeof product.variants === 'string') {
            try {
                product.variants = JSON.parse(product.variants);
            } catch (e) {
                product.variants = [];
            }
        }
        
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Generate Metadata untuk SEO (Opsional tapi bagus)
export async function generateMetadata({ params }) {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: 'Produk Tidak Ditemukan' };
    
    return {
        title: `${product.name} | Toko Saya`,
        description: product.description?.substring(0, 160),
    };
}

export default async function ProductViewPage({ params }) {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound(); // Akan menampilkan halaman 404 Next.js
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-10">
                <ProductDetailClient product={product} />
            </div>
        </div>
    );
}