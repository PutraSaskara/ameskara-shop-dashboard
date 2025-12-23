// app/(dashboard)/articles/components/Editor.jsx
'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';

export default function Editor({ value, onChange, holder }) {
  const ref = useRef(); // Ref untuk menyimpan instance editor

  // Fungsi untuk inisialisasi editor
  const initializeEditor = async () => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder, // ID elemen div tempat editor muncul
        placeholder: 'Mulai tulis ceritamu di sini...',
        data: value, // Data awal (untuk mode edit)
        
        // --- KONFIGURASI TOOLS ---
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Judul Heading',
              levels: [2, 3, 4], // Hanya izinkan h2, h3, h4
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Masukkan kutipan...',
              captionPlaceholder: 'Tokoh',
            },
          },
          image: {
            class: ImageTool,
            config: {
              // --- DISINI KITA HUBUNGKAN KE BACKEND ---
              endpoints: {
                byFile: `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/upload-image`, // Endpoint upload file
                byUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/fetch-image`, // (Opsional) jika mau fetch by URL
              },
              additionalRequestHeaders: {
                // Kirim token admin agar diizinkan upload
                Authorization: `Bearer ${localStorage.getItem('admin_token')}` 
              }
            }
          }
        },
        
        // Callback setiap kali ada perubahan ketikan
        onChange: async (api, event) => {
          const content = await api.saver.save();
          onChange(content); // Kirim data JSON ke parent component
        },
      });

      ref.current = editor;
    }
  };

  useEffect(() => {
    // Pastikan ini hanya jalan di browser
    if (typeof window !== 'undefined') {
      initializeEditor();
    }

    // Cleanup saat component di-unmount
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
        ref.current = null;
      }
    };
  }, []);

  return (
    <div 
      id={holder} 
      className="prose max-w-none border border-gray-300 rounded-lg p-4 min-h-[300px] bg-white text-black"
    />
  );
}