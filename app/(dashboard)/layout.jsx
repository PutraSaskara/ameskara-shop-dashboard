// app/(dashboard)/layout.jsx
import Sidebar from './components/Sidebar'; // Pastikan path import sesuai struktur folder Anda

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Component (Client) */}
            <Sidebar />

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* pt-16 md:pt-0: Memberi padding atas di mobile agar konten tidak tertutup Header Mobile. 
                    Di desktop padding dihapus.
                */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
}