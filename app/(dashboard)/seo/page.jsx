'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const PAGES = [
  { key: 'home', name: 'Beranda (Home)', path: '/' },
  { key: 'shop', name: 'Katalog Produk (Shop)', path: '/shop' },
  { key: 'our-story', name: 'Cerita Kami (Our Story)', path: '/our-story' },
  { key: 'journal', name: 'Jurnal & Tips (Journal)', path: '/journal' },
  { key: 'contact-us', name: 'Hubungi Kami (Contact)', path: '/contact-us' },
  { key: 'shipping', name: 'Pengiriman (Shipping)', path: '/shipping' },
  { key: 'terms', name: 'Syarat & Ketentuan (Terms)', path: '/terms' },
  { key: 'global', name: 'Default Global (Situs)', path: '*' },
];

export default function SeoManagementPage() {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState('home');
  const [seoList, setSeoList] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    canonical_url: '',
    geo_region: 'ID-BA',
    geo_placename: 'Denpasar, Bali',
    geo_position: '-8.6705;115.2126',
    icbm: '-8.6705, 115.2126',
    structured_data: '',
  });
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchSeoData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');

      try {
        const res = await fetch(`${API_URL}/seo/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          const map = {};
          (json.data || []).forEach((item) => {
            map[item.page_key] = item;
          });
          setSeoList(map);

          if (map['home']) {
            setFormData({
              title: map['home'].title || '',
              description: map['home'].description || '',
              keywords: map['home'].keywords || '',
              og_image: map['home'].og_image || '',
              canonical_url: map['home'].canonical_url || '',
              geo_region: map['home'].geo_region || 'ID-BA',
              geo_placename: map['home'].geo_placename || 'Denpasar, Bali',
              geo_position: map['home'].geo_position || '-8.6705;115.2126',
              icbm: map['home'].icbm || '-8.6705, 115.2126',
              structured_data: map['home'].structured_data || '',
            });
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data SEO:', err);
        toast.error('Gagal memuat konfigurasi SEO');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeoData();
  }, [API_URL, router]);

  const handleSelectPage = (key) => {
    setActiveKey(key);
    const item = seoList[key] || {};
    setFormData({
      title: item.title || '',
      description: item.description || '',
      keywords: item.keywords || '',
      og_image: item.og_image || '',
      canonical_url: item.canonical_url || '',
      geo_region: item.geo_region || 'ID-BA',
      geo_placename: item.geo_placename || 'Denpasar, Bali',
      geo_position: item.geo_position || '-8.6705;115.2126',
      icbm: item.icbm || '-8.6705, 115.2126',
      structured_data: item.structured_data || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Sesi login telah berakhir');
      router.push('/login');
      return;
    }

    const bodyData = new FormData();
    bodyData.append('image', file);

    setIsUploadingImage(true);
    const toastId = toast.loading('Mengunggah gambar SEO...');
    try {
      const res = await fetch(`${API_URL}/seo/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: bodyData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal mengunggah gambar');
      }

      const uploadedUrl = result.data?.url || result.url;
      if (!uploadedUrl) {
        throw new Error('URL gambar tidak ditemukan dalam respons');
      }

      setFormData((prev) => ({ ...prev, og_image: uploadedUrl }));
      toast.success('Gambar SEO berhasil diunggah!', { id: toastId });
    } catch (err) {
      console.error('Error upload image:', err);
      toast.error(err.message || 'Gagal mengunggah gambar', { id: toastId });
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.structured_data && formData.structured_data.trim() !== '') {
      try {
        JSON.parse(formData.structured_data);
      } catch (err) {
        toast.error("Format Structured Data harus berupa JSON valid!");
        return;
      }
    }
    setIsSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${API_URL}/seo/${activeKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menyimpan pengaturan SEO');
      }

      setSeoList((prev) => ({
        ...prev,
        [activeKey]: { ...formData, page_key: activeKey },
      }));

      toast.success(`SEO & GEO '${activeKey}' berhasil disimpan!`);
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const activePageInfo = PAGES.find((p) => p.key === activeKey) || PAGES[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Manajemen SEO & GEO</h1>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">AI Search Ready</span>
        </div>
        <p className="text-gray-500 text-sm">
          Optimasi ganda untuk <strong>Google Search</strong> dan <strong>Generative AI Search Engine</strong> (ChatGPT Search, Perplexity AI, Claude, Google AI Overviews).
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-gray-500">Memuat konfigurasi SEO...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Tab Pilihan Halaman */}
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Pilih Halaman</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm space-y-1">
              {PAGES.map((page) => {
                const isSelected = activeKey === page.key;
                const hasConfig = Boolean(seoList[page.key]?.title);
                return (
                  <button
                    key={page.key}
                    type="button"
                    onClick={() => handleSelectPage(page.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between text-sm ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div>
                      <p className="leading-snug">{page.name}</p>
                      <span className={`text-[11px] ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {page.path}
                      </span>
                    </div>
                    {hasConfig && (
                      <span
                        className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-300' : 'bg-green-500'}`}
                        title="Telah Dikonfigurasi"
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live Google Snippet Mockup Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Hasil Pencarian Google</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">
                    A
                  </div>
                  <span className="text-[11px] text-gray-600 truncate">
                    {formData.canonical_url || `https://www.ameskarasprei.shop${activePageInfo.path}`}
                  </span>
                </div>
                <h4 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer leading-tight mb-1 line-clamp-2">
                  {formData.title || 'Judul Halaman Belum Diisi'}
                </h4>
                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {formData.description || 'Deskripsi pencarian belum diisi. Google akan menampilkan cuplikan otomatis dari konten halaman.'}
                </p>
              </div>

              {/* Info GEO / llms.txt */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-indigo-600">
                  <span>🤖</span>
                  <span>Format Standar AI:</span>
                </div>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700">/llms.txt (Aktif)</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Pengaturan SEO & GEO */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Halaman: {activePageInfo.name}
                  </span>
                  <h2 className="text-xl font-black mt-2 text-gray-900">Pengaturan Meta Tag, FAQ & AI Search</h2>
                </div>
              </div>

              {/* 1. Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-gray-800">
                    Meta Title (Judul Tab & Google) <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      formData.title.length >= 50 && formData.title.length <= 60
                        ? 'text-green-600 font-bold'
                        : formData.title.length > 60
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {formData.title.length} / 60 karakter
                  </span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Sprei Katun Premium Bali | Ameskara"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">Disarankan 50–60 karakter agar tidak terpotong di hasil pencarian Google.</p>
              </div>

              {/* 2. Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-gray-800">Meta Description (Deskripsi Ringkasan)</label>
                  <span
                    className={`text-xs font-medium ${
                      formData.description.length >= 140 && formData.description.length <= 160
                        ? 'text-green-600 font-bold'
                        : formData.description.length > 160
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {formData.description.length} / 160 karakter
                  </span>
                </div>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Deskripsikan isi halaman ini secara menarik untuk mengajak pengunjung mengklik hasil Google..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">Target ideal 140–160 karakter untuk performa SEO klik (CTR) terbaik.</p>
              </div>

              {/* 3. Keywords & Canonical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-800 block mb-1.5">Kata Kunci (Keywords)</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="sprei bali, bedcover premium, sprei katun"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Pisahkan kata kunci dengan tanda koma (,).</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-800 block mb-1.5">URL Kanonis (Canonical URL)</label>
                  <input
                    type="url"
                    name="canonical_url"
                    value={formData.canonical_url}
                    onChange={handleChange}
                    placeholder="https://www.ameskarasprei.shop/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Mencegah duplikasi konten antar protokol atau www.</p>
                </div>
              </div>

              {/* 4. OpenGraph Image */}
              <div>
                <label className="text-sm font-bold text-gray-800 block mb-1.5">Social Share Image (Open Graph Image URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    name="og_image"
                    value={formData.og_image}
                    onChange={handleChange}
                    placeholder="https://res.cloudinary.com/.../og-banner.webp"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-sm"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-gray-200 shrink-0 disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Upload Gambar</span>
                      </>
                    )}
                  </button>
                </div>
                {formData.og_image && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.og_image}
                      alt="OG Image Preview"
                      className="w-24 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">Preview Gambar Sosial</p>
                      <p className="text-[11px] text-gray-400 truncate">{formData.og_image}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, og_image: '' }))}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-1">Gambar yang otomatis muncul saat link dibagikan di WhatsApp, Facebook, dan Twitter (Rekomendasi rasio 1.91:1, contoh: 1200x630px).</p>
              </div>
              {/* 5. Section GEO (Generative Engine Optimization & Entity Grounding) */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Generative Engine Optimization (GEO) & Sinyal Entitas AI</h3>
                    <p className="text-xs text-gray-500">
                      Membantu ChatGPT, Perplexity, dan Google Gemini memahami keaslian brand, spesifikasi produk, dan rujukan lokasi.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Entitas Wilayah Bisnis (ISO Region)</label>
                      <input
                        type="text"
                        name="geo_region"
                        value={formData.geo_region}
                        onChange={handleChange}
                        placeholder="ID-BA"
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400">ID-BA untuk identitas brand asal Bali, Indonesia.</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Nama Tempat & Workshop (Placename)</label>
                      <input
                        type="text"
                        name="geo_placename"
                        value={formData.geo_placename}
                        onChange={handleChange}
                        placeholder="Denpasar, Bali"
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs"
                      />
                      <span className="text-[10px] text-gray-400">Memberikan grounding faktual lokasi toko kepada model LLM.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Koordinat Grounding Peta (Latitude;Longitude)</label>
                      <input
                        type="text"
                        name="geo_position"
                        value={formData.geo_position}
                        onChange={handleChange}
                        placeholder="-8.6705;115.2126"
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400">Denpasar Bali: -8.6705;115.2126</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">ICBM Coordinates</label>
                      <input
                        type="text"
                        name="icbm"
                        value={formData.icbm}
                        onChange={handleChange}
                        placeholder="-8.6705, 115.2126"
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400">Verifikasi penandaan geografis standar search engine.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Section Kustom Structured Data (JSON-LD) */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📋</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Kustom Structured Data (JSON-LD)</h3>
                    <p className="text-xs text-gray-500">
                      Skema JSON-LD kustom untuk rich snippets di mesin pencari (Organization, Store, FAQPage, BreadcrumbList, dll).
                    </p>
                  </div>
                </div>
                <textarea
                  name="structured_data"
                  rows={6}
                  value={formData.structured_data}
                  onChange={handleChange}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Store",\n  "name": "Ameskara Bali",\n  "url": "https://www.ameskarasprei.shop"\n}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none text-xs font-mono bg-gray-50"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Pastikan format berupa JSON valid. Kosongkan jika halaman ini menggunakan schema bawaan otomatis.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Perubahan SEO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
