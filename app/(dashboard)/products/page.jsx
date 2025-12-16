// app/(dashboard)/products/page.jsx

import Link from 'next/link';
import Image from 'next/image';
import DeleteButton from '../products/components/DeleteButton.jsx';
import ProductSearch from '../products/components/ProductSearch.jsx';
import Pagination from '../products/components/Pagination.jsx'; 
import CategoryFilter from '../products/components/CategoryFilter.jsx';

// --- Function Fetch Kategori ---
async function getCategories() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Gagal fetching kategori:", error);
    return [];
  }
}

// Function fetching data
async function getDashboardProducts(query = '', category = '', page = 1) {
  const API_KEY = process.env.WEB_API_KEY; 
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (category) params.set('category', category);
  params.set('page', page);
  params.set('limit', 10); 

  const endpoint = `${API_URL}/products/public?${params.toString()}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY || '' },
      cache: 'no-store' 
    });

    if (!res.ok) return { products: [], pagination: {} };

    const responseJson = await res.json();
    let productsList = responseJson.data || [];
    const paginationInfo = responseJson.pagination || {};
    
    // Parsing Variants
    productsList = productsList.map(product => {
        if (typeof product.variants === 'string') {
            try { product.variants = JSON.parse(product.variants); } catch (e) { product.variants = []; }
        }
        return product;
    });

    return { products: productsList, pagination: paginationInfo };

  } catch (error) {
    console.error("Gagal fetching produk:", error);
    return { products: [], pagination: {} };
  }
}

export default async function ProductsPage({ searchParams }) {
  const query = searchParams?.search || '';
  const categoryQuery = searchParams?.category || ''; 
  const currentPage = Number(searchParams?.page) || 1;
  
  const [productsData, categories] = await Promise.all([
      getDashboardProducts(query, categoryQuery, currentPage),
      getCategories()
  ]);

  const { products, pagination } = productsData;
  
  // Cari nama kategori yang sedang aktif untuk ditampilkan di UI
  const activeCategoryName = categoryQuery 
    ? categories.find(c => c.slug === categoryQuery)?.name 
    : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Products
                    {/* Tampilkan Badge Kategori jika sedang difilter */}
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
                {/* 4. Filter Kategori */}
                <CategoryFilter categories={categories} />

                {/* Search */}
                <ProductSearch />

                <Link 
                    href="/products/create" 
                    className="inline-flex justify-center items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 transform duration-150 whitespace-nowrap"
                >
                <span className="text-lg leading-none">+</span> Add Product
                </Link>
            </div>
        </div>
      </div>

      {products.length === 0 ? (
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
                <Link href="/products" className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                    Reset Semua Filter
                </Link>
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
                                    <Image src={product.banner_image} alt={product.name} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
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
                            <Link href={`/products/edit/${product.slug}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </Link>
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