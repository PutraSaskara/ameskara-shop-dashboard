# Panduan Integrasi Frontend (Pembaruan Backend Terbaru)

Dokumen ini berisi ringkasan pembaruan backend terbaru untuk membantu *AI Assistant* atau developer yang sedang mengerjakan **Dashboard Frontend** dan **Web Utama (Next.js)** agar dapat menyesuaikan payload data dan memahami struktur respons API saat ini.

---

## 1. Fitur Harga Berbeda Setiap Ukuran (Size)

Sekarang, setiap ukuran (size) di dalam varian produk dapat memiliki harga masing-masing. Harga ini disimpan di dalam array `sizes` dari kolom JSON `variants` pada tabel `products`.

### Perubahan untuk Frontend (Dashboard):
Saat melakukan **Tambah Produk** (`POST /api/products`) atau **Edit Produk** (`PUT /api/products/:id`), field `variants` yang dikirim (dalam format JSON string) harus menyertakan field `price` di dalam array `sizes`.

**Contoh Struktur JSON `variants` yang Diharapkan:**
```json
[
  {
    "color": "Putih",
    "sizes": [
      { "size": "120x200", "stock": 10, "price": 100000 }, // Harga untuk ukuran 120
      { "size": "160x200", "stock": 10, "price": 120000 }  // Harga untuk ukuran 160
    ]
  },
  {
    "color": "Emas Premium",
    "sizes": [
      { "size": "180x200", "stock": 5, "price": 150000 } // Varian ini harganya berbeda
    ]
  }
]
```

> **PENTING**: Kolom `price` utama di level produk (global price) **tetap wajib diisi** karena skema database (`NOT NULL`). Frontend bisa menganggapnya sebagai "Harga Mulai Dari" atau harga default.

---

## 2. Migrasi Penyimpanan Gambar ke Cloudinary

Seluruh file gambar (Banner Produk, Gambar Varian, Thumbnail Artikel, dan Gambar di dalam Editor Blog) kini tidak lagi disimpan di direktori lokal server (`public/uploads`), melainkan langsung diunggah ke **Cloudinary**.

### Apa yang Berubah untuk Frontend?

1.  **Format URL Gambar dalam Respons API**: 
    Seluruh *endpoint* API (GET Produk, GET Artikel, dll) kini akan mengembalikan URL gambar absolut dari Cloudinary.
    *   **Sebelumnya**: `https://ameskarabed.saskaraputra.my.id/uploads/banner-123.webp`
    *   **Sekarang**: `https://res.cloudinary.com/ddw29fkhd/image/upload/v1777009360/ameskara/banner-123.webp`
    *(Pastikan komponen UI `<img>` atau `next/image` Anda di frontend mendukung domain `res.cloudinary.com` di `next.config.js` jika menggunakan Next.js Image Optimization).*

2.  **Proses Upload Data (Form Data)**:
    **TIDAK ADA PERUBAHAN.** Frontend tetap mengirimkan file gambar menggunakan format `multipart/form-data` dengan parameter *key* yang sama seperti sebelumnya (misal: `productBanner` dan `variantImages[]`). Backend akan secara otomatis menangani *upload stream* ke Cloudinary.

3.  **Hapus/Edit Produk dan Artikel**:
    Backend sudah dirancang untuk secara otomatis membaca URL Cloudinary lama dan menghapus *asset* tersebut dari server Cloudinary saat produk atau artikel diperbarui atau dihapus. Frontend tidak perlu melakukan pemanggilan API khusus untuk menghapus gambar.

4.  **Upload Image Editor (Block Editor)**:
    API `POST /api/articles/upload-image` (yang biasanya dipakai oleh Editor.js) kini akan memberikan balasan JSON dengan URL Cloudinary:
    ```json
    {
      "success": 1,
      "file": {
        "url": "https://res.cloudinary.com/ddw29fkhd/image/upload/v123.../ameskara/image.webp"
      }
    }
    ```
    Frontend editor akan otomatis menangkap dan merender URL ini.

---
*Catatan ini dibuat agar AI yang memodifikasi kode frontend Next.js/React paham akan struktur data yang baru dan konfigurasi domain gambar yang diperlukan.*
