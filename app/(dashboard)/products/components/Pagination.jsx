// app/(dashboard)/products/components/Pagination.jsx
import Link from 'next/link';

// Tambahkan prop 'category'
export default function Pagination({ pagination, search, category }) { 
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Update Helper URL
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category); // <--- TAMBAHKAN INI
    params.set('page', pageNumber);
    return `/products?${params.toString()}`;
  };

  // ... (Sisa kode return JSX tetap sama seperti sebelumnya) ...
  return (
      // ... copy paste JSX yang lama di sini ...
      // Biar hemat tempat saya tidak tulis ulang JSX nya, 
      // intinya logic createPageURL di atas yang penting.
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-xl">
          {/* ... Implementasi UI sama seperti sebelumnya ... */}
           <div className="flex flex-1 justify-between sm:hidden">
            <Link
              href={hasPrevPage ? createPageURL(currentPage - 1) : '#'}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!hasPrevPage && 'pointer-events-none opacity-50'}`}
            >
              Previous
            </Link>
            <Link
              href={hasNextPage ? createPageURL(currentPage + 1) : '#'}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!hasNextPage && 'pointer-events-none opacity-50'}`}
            >
              Next
            </Link>
          </div>
          {/* Desktop view logic ... */}
             <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                   <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Link
                      href={hasPrevPage ? createPageURL(currentPage - 1) : '#'}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasPrevPage && 'pointer-events-none opacity-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                    </Link>
                    <Link
                      href={hasNextPage ? createPageURL(currentPage + 1) : '#'}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasNextPage && 'pointer-events-none opacity-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                    </Link>
                  </nav>
                </div>
             </div>
      </div>
  );
}