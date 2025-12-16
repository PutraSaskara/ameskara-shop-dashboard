'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailClient({ product }) {
    // State untuk pilihan user
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    
    // State untuk gambar yang ditampilkan (Default: Banner atau Gambar Varian Pertama)
    const [currentImage, setCurrentImage] = useState(
        product.banner_image || (product.variants[0]?.image) || null
    );

    // Cari data varian berdasarkan warna yang dipilih
    const currentVariant = product.variants.find(v => v.color === selectedColor);

    // Handler saat Warna dipilih
    const handleColorSelect = (color, variantImage) => {
        setSelectedColor(color);
        setSelectedSize(null); // Reset size saat ganti warna
        
        // Ganti gambar jika varian punya gambar khusus, jika tidak biarkan gambar sekarang
        if (variantImage) {
            setCurrentImage(variantImage);
        }
    };

    // Handler untuk tombol Beli (Simulasi kirim ke Email/WhatsApp)
    const handleBuy = () => {
        if (!selectedColor || !selectedSize) {
            alert('Harap pilih Warna dan Ukuran terlebih dahulu!');
            return;
        }

        const subject = `Order: ${product.name}`;
        const body = `Halo, saya ingin memesan:
        
Produk: ${product.name}
Warna: ${selectedColor}
Ukuran: ${selectedSize}
Harga: Rp${product.price.toLocaleString('id-ID')}

Mohon infokan ketersediaannya.`;

        // Contoh membuka email client
        window.open(`mailto:admin@tokoanda.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* --- KOLOM KIRI: GALERI GAMBAR --- */}
            <div className="space-y-4">
                {/* Gambar Utama */}
                <div className="relative aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    {currentImage ? (
                        <Image
                            src={currentImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Thumbnail List (Banner + Variants) */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Thumbnail Banner */}
                    {product.banner_image && (
                        <button 
                            onClick={() => setCurrentImage(product.banner_image)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${currentImage === product.banner_image ? 'border-indigo-600' : 'border-transparent'}`}
                        >
                            <Image src={product.banner_image} alt="Banner" fill className="object-cover" />
                        </button>
                    )}
                    
                    {/* Thumbnail Variants */}
                    {product.variants.map((v, i) => (
                        v.image && (
                            <button 
                                key={i}
                                onClick={() => handleColorSelect(v.color, v.image)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${currentImage === v.image ? 'border-indigo-600' : 'border-transparent'}`}
                            >
                                <Image src={v.image} alt={v.color} fill className="object-cover" />
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* --- KOLOM KANAN: INFO PRODUK --- */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
                <p className="text-2xl font-semibold text-indigo-600 mt-2">
                    Rp {product.price.toLocaleString('id-ID')}
                </p>

                {/* Deskripsi */}
                <div className="mt-6 prose prose-sm text-gray-600">
                    <p>{product.description}</p>
                </div>

                <div className="mt-8 space-y-6">
                    
                    {/* PILIH WARNA */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Pilih Warna</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((variant, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorSelect(variant.color, variant.image)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                        selectedColor === variant.color
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {variant.color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PILIH UKURAN (Muncul setelah warna dipilih) */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Pilih Ukuran 
                            {selectedColor && <span className="text-gray-500 font-normal ml-2">(untuk {selectedColor})</span>}
                        </h3>
                        
                        {!selectedColor ? (
                            <p className="text-sm text-gray-400 italic">Silakan pilih warna terlebih dahulu untuk melihat ukuran.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {currentVariant?.sizes.map((item, idx) => {
                                    const isOutOfStock = item.stock <= 0;
                                    return (
                                        <button
                                            key={idx}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(item.size)}
                                            className={`
                                                relative px-4 py-2 rounded-md text-sm font-medium border transition-all
                                                ${isOutOfStock 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 decoration-slice' 
                                                    : selectedSize === item.size
                                                        ? 'bg-black text-white border-black'
                                                        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-800'
                                                }
                                            `}
                                        >
                                            {item.size}
                                            {isOutOfStock && (
                                                <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">Habis</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* TOMBOL AKSI */}
                    {/* <div className="pt-6 border-t border-gray-100">
                        <button
                            onClick={handleBuy}
                            disabled={!selectedColor || !selectedSize}
                            className={`w-full py-4 px-8 rounded-xl flex items-center justify-center text-lg font-bold transition-all shadow-lg ${
                                !selectedColor || !selectedSize
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                        >
                            Beli Sekarang via Email
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            *Data ukuran dan warna akan diteruskan ke email admin.
                        </p>
                    </div> */}

                </div>
            </div>
        </div>
    );
}