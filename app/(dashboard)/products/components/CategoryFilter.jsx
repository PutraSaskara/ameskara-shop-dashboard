'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryFilter({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil nilai saat ini dari URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search'); // Ambil search jika ada

  const handleFilterChange = (e) => {
    const selectedCategory = e.target.value;
    const params = new URLSearchParams();

    // 1. Cek apakah ada Search Query sebelumnya? Jika ada, pertahankan.
    if (currentSearch) {
      params.set('search', currentSearch);
    }

    // 2. Set Category (Hanya jika user tidak memilih opsi default/kosong)
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    // 3. Reset halaman ke 1 setiap kali filter berubah
    params.set('page', '1');

    // 4. Update URL
    // Hasilnya bisa: /products?category=baju (Tanpa search)
    // Atau: /products?search=merah&category=baju (Dengan search)
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={currentCategory}
        onChange={handleFilterChange}
        className="appearance-none w-full sm:w-48 bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
      >
        <option value="">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      
      {/* Icon Panah Dropdown */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}