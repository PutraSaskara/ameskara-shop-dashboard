// app/page.jsx

import { redirect } from 'next/navigation';

// Karena ini adalah Server Component, kita bisa langsung menggunakan redirect
export default function HomePage() {
  // Arahkan user ke halaman login secara default
  redirect('/login');
}

// Catatan: Jika Anda ingin membedakan antara user yang sudah login dan belum, 
// Anda perlu menggunakan Next.js Middleware atau Server Action 
// untuk membaca cookie token sebelum melakukan redirect.