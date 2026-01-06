// app/(dashboard)/components/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '../../(dashboard)/products/components/LogoutButton'; 

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Data Menu
    const menuItems = [
        { 
            name: 'Produk', 
            href: '/products', 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            )
        },
        // --- MENU BARU: KATEGORI ---
        { 
            name: 'Kategori', 
            href: '/categories', 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            )
        },
        { 
    name: 'Artikel', 
    href: '/articles', 
    icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    )
},
        // ---------------------------
        // { 
        //     name: 'Pesanan', 
        //     href: '/orders', 
        //     icon: (
        //         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        //     )
        // },
    ];

    return (
        <>
            {/* --- MOBILE HEADER (Hanya muncul di layar kecil) --- */}
            <div className="md:hidden flex items-center justify-between bg-gray-900 text-white p-4 fixed top-0 left-0 w-full z-20 shadow-md">
                <span className="font-bold text-lg">Admin Panel</span>
                <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* --- OVERLAY (Background gelap saat menu mobile terbuka) --- */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* --- SIDEBAR UTAMA --- */}
            <aside className={`
                fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out shadow-xl overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:h-screen
            `}>
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold tracking-wider text-indigo-400">Admin<span className="text-white">Panel</span></h2>
                </div>

                <nav className="p-4 space-y-2">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            // Logic highlight aktif: cocokkan href dengan pathname
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <li key={item.href}>
                                    <Link 
                                        href={item.href} 
                                        onClick={() => setIsOpen(false)} // Tutup menu saat link diklik (mobile)
                                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                            isActive 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Separator */}
                    <div className="border-t border-gray-800 my-4"></div>

                    <div className="px-3">
                        <LogoutButton />
                    </div>
                </nav>
            </aside>
        </>
    );
}