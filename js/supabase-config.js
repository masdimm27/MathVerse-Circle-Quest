/**
 * MathVerse — Circle Quest
 * js/supabase-config.js
 * 
 * Konfigurasi Klien Publik Supabase (Frontend).
 * 
 * PENTING:
 * 1. Hanya gunakan SUPABASE_URL dan SUPABASE_ANON_KEY (Public anon key).
 * 2. JANGAN PERNAH memasukkan secret key (service_role) di file frontend ini!
 * 3. Anda dapat mengisi nilai default di bawah ini, atau menyetelnya melalui
 *    modal "Konfigurasi Supabase" di antarmuka web (tersimpan di localStorage).
 */

const MATHVERSE_SUPABASE_DEFAULT_CONFIG = {
  // Masukkan Supabase Project URL Anda jika ingin disetel statis
  // Contoh: 'https://xyzcompany.supabase.co'
  url: '',

  // Masukkan Supabase Public Anon Key Anda jika ingin disetel statis
  // Contoh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  anonKey: ''
};

// Pasang ke window global agar dapat diakses oleh modul lain
if (typeof window !== 'undefined') {
  window.MATHVERSE_SUPABASE_DEFAULT_CONFIG = MATHVERSE_SUPABASE_DEFAULT_CONFIG;
}
