'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      // Hapus cookie dan lempar ke login jika tidak ada token di localStorage
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
      setIsAuthorized(false);
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Pastikan cookie tetap sinkron dengan token di localStorage
    document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    setIsAuthorized(true);
  }, [router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-600">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
