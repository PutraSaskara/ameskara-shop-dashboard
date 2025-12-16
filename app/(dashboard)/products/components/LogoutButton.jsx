// app/(dashboard)/components/LogoutButton.jsx
'use client'; // <-- WAJIB ADA

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        // Hapus token dan redirect
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_role');
            // Menggunakan router.replace untuk membersihkan riwayat navigasi
            router.replace('/login'); 
        }
    };

    return (
        <button 
            className="block p-2 rounded hover:bg-red-700 w-full text-left bg-red-600"
            onClick={handleLogout} // <-- Sekarang onClick aman karena di Client Component
        >
            Logout
        </button>
    );
}