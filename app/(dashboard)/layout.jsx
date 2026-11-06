// app/(dashboard)/layout.jsx
import Sidebar from './components/Sidebar';
import AuthGuard from './components/AuthGuard';

export default function DashboardLayout({ children }) {
    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                {/* Sidebar Component (Client) */}
                <Sidebar />

                {/* Konten Utama */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}