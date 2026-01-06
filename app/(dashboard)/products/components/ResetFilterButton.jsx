'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetFilterButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true);
    router.push('/products');
  };

  return (
    <button 
        onClick={handleClick} 
        disabled={isLoading} 
        className={`mt-4 text-indigo-600 hover:text-indigo-800 font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {isLoading ? 'Memuat...' : 'Reset Semua Filter'}
    </button>
  );
}
