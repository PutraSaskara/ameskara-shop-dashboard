/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan objek ini untuk konfigurasi gambar
  images: {
    // Domain yang diizinkan untuk di-load oleh next/image
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000', // PENTING: Tentukan port backend Anda
        pathname: '/uploads/**', // Izinkan akses ke semua path di bawah /uploads
      },
      // Anda bisa menambahkan domain lain di sini jika ada CDN atau staging server
    ],
  },
};

export default nextConfig;
