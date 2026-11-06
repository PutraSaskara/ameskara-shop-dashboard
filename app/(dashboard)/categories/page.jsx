import Link from 'next/link';
import DeleteCategoryButton from './components/DeleteCategoryButton';

async function getCategories() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const res = await fetch(`${API_URL}/categories`, { 
        cache: 'no-store' // Agar data selalu fresh (tidak dicache)
    });
    
    if (!res.ok) return [];
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Kategori Produk</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola jenis-jenis produk ({categories.length} kategori)</p>
        </div>
        <Link 
            href="/categories/create" 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 transform duration-150"
        >
          <span className="text-lg leading-none">+</span> Buat Kategori
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 text-3xl">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada kategori</h3>
            <p className="text-gray-500 mt-2 max-w-sm">Silakan buat kategori pertama Anda untuk mengelompokkan produk.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">No</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug URL</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                            {cat.slug}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                            <Link
                                href={`/categories/edit/${cat.id}`}
                                className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                                title="Edit Kategori"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </Link>
                            <DeleteCategoryButton categoryId={cat.id} />
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}