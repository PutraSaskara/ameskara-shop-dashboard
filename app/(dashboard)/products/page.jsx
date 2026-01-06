'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteButton from './components/DeleteButton';
import ProductSearch from './components/ProductSearch';
import Pagination from './components/Pagination'; 
import CategoryFilter from './components/CategoryFilter';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Reset loading states saat navigasi selesai/data baru diambil
      setIsAddLoading(false);
      setIsResetLoading(false);
      setEditingId(null);

      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const API_KEY = process.env.NEXT_PUBLIC_WEB_API_KEY; // Pastikan variabel ini ada di .env jika diperlukan
      console.log("DEBUG: API_URL =", API_URL); // Cek apakah env terbaca
      console.log("DEBUG: API_KEY =", API_KEY); // Cek apakah env terbaca

      try {
        // 1. Fetch Categories
        const catRes = await fetch(`${API_URL}/categories`);
        const catData = await catRes.json();
        setCategories(catData || []);

        // 2. Fetch Products
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (categoryQuery) params.set('category', categoryQuery);
        params.set('page', page);
        params.set('limit', 10);

        const endpoint = `${API_URL}/products/public?${params.toString()}`;
        console.log("DEBUG: Fetching URL =", endpoint); // Cek URL lengkap

        const prodRes = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY || '' },
          cache: 'no-store'
        });

        console.log("DEBUG: Response Status =", prodRes.status); // Cek status code (200, 404, 500?)

        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          console.log("DEBUG: Raw JSON Response =", prodJson); // Cek isi data asli dari backend
          let productsList = prodJson.data || [];
          
          // Parsing Variants
          productsList = productsList.map(product => {
              if (typeof product.variants === 'string') {
                  try { product.variants = JSON.parse(product.variants); } catch (e) { product.variants = []; }
              }
              return product;
          });

          setProducts(productsList);
          setPagination(prodJson.pagination || {});
        }
      } catch (error) {
        console.error("Gagal fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, categoryQuery, page]);

  // Cari nama kategori yang sedang aktif
  const activeCategoryName = categoryQuery 
    ? categories.find(c => c.slug === categoryQuery)?.name 
    : null;

  const handleAddClick = (e) => {
    e.preventDefault();
    setIsAddLoading(true);
    router.push('/products/create');
  };

  const handleResetClick = (e) => {
    e.preventDefault();
    setIsResetLoading(true);
    router.push('/products');
  };

  const handleEditClick = (e, slug, id) => {
    e.preventDefault();
    setEditingId(id);
    router.push(`/products/edit/${slug}`);
  };

  console.log('Products:', products);
  console.log('Categories:', categories);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Products
                    {activeCategoryName && (
                        <span className="text-sm font-normal bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                            Kategori: {activeCategoryName}
                        </span>
                    )}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage your product inventory ({pagination.totalItems || products.length} items)
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <CategoryFilter categories={categories} />
                <ProductSearch />
                
                <button 
                    onClick={handleAddClick}
                    disabled={isAddLoading}
                    className={`inline-flex justify-center items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 transform duration-150 whitespace-nowrap ${isAddLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isAddLoading ? (
                        <span>Loading...</span>
                    ) : (
                        <>
                            <span className="text-lg leading-none">+</span> Add Product
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">📦</div>
            <h3 className="text-lg font-semibold text-gray-900">
                {query || categoryQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
            </h3>
            <p className="text-gray-500 mt-2 max-w-sm">
                {categoryQuery && !query 
                    ? `Tidak ada produk dalam kategori "${activeCategoryName || categoryQuery}".`
                    : query 
                        ? `Tidak ada hasil pencarian untuk "${query}".`
                        : 'Mulai dengan menambahkan produk pertama Anda.'
                }
            </p>
            {(query || categoryQuery) && (
                <button 
                    onClick={handleResetClick} 
                    disabled={isResetLoading} 
                    className={`mt-4 text-indigo-600 hover:text-indigo-800 font-medium ${isResetLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isResetLoading ? 'Memuat...' : 'Reset Semua Filter'}
                </button>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Product</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors duration-150 group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {product.banner_image ? (
                                    <Image 
                                        src={product.banner_image} 
                                        alt={product.name} 
                                        fill 
                                        sizes="64px" 
                                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate pr-4">{product.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5 font-mono">ID: {product.id}</p>
                            </div>
                        </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {product.category_name || '-'}
                        </span>
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                            Rp {product.price.toLocaleString('id-ID')}
                        </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' : product.stock > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {product.stock}
                        </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-600">{product.variants.length}</span>
                            <span className="text-xs text-gray-400">colors</span>
                        </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Link href={`/products/view/${product.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </Link>
                            <button 
                                onClick={(e) => handleEditClick(e, product.slug, product.id)}
                                disabled={editingId === product.id}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                            >
                                {editingId === product.id ? (
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                )}
                            </button>
                            <div className="text-gray-400 hover:text-red-600 transition-colors">
                                <DeleteButton productId={product.id} /> 
                            </div>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} search={query} category={categoryQuery} />
          
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
