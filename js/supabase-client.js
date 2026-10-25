/**
 * MathVerse — Circle Quest
 * js/supabase-client.js
 * 
 * Adapter komunikasi frontend dengan Supabase:
 * - Mengelola inisialisasi createClient Supabase (JS SDK v2)
 * - Memanggil start_game_session (Inisialisasi Sesi Server Resmi & Token Kriptografis)
 * - Memanggil submit_game_session(UUID, TEXT, JSONB) (Validasi Server-Authoritative)
 * - Memanggil get_leaderboard(INT, BOOLEAN) (Papan Peringkat Resmi Bersama)
 * - Persistensi konfigurasi publik aman di browser
 */

const MathVerseSupabase = (() => {
  'use strict';

  const STORAGE_URL_KEY = 'mathverse_supabase_url';
  const STORAGE_KEY_KEY = 'mathverse_supabase_anon_key';

  let supabaseInstance = null;

  /**
   * Mengambil konfigurasi aktif dari localStorage atau default config
   */
  const getConfig = () => {
    const defaultCfg = (typeof window !== 'undefined' && window.MATHVERSE_SUPABASE_DEFAULT_CONFIG) 
      ? window.MATHVERSE_SUPABASE_DEFAULT_CONFIG 
      : { url: '', anonKey: '' };

    let savedUrl = '';
    let savedKey = '';

    try {
      savedUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
      savedKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
    } catch (e) {
      console.warn('Gagal mengakses localStorage:', e);
    }

    return {
      url: (savedUrl || defaultCfg.url || '').trim(),
      anonKey: (savedKey || defaultCfg.anonKey || '').trim()
    };
  };

  /**
   * Menyimpan konfigurasi baru ke localStorage dan memperbarui instance klien
   */
  const saveConfig = (url, anonKey) => {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '');
    const cleanKey = (anonKey || '').trim();

    // Pencegahan penggunaan service_role token di frontend
    if (cleanKey.toLowerCase().includes('service_role')) {
      throw new Error('Dilarang menggunakan token service_role di browser! Gunakan hanya anon public key demi keamanan database.');
    }

    try {
      localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
      localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    } catch (e) {
      console.warn('Gagal menyimpan konfigurasi ke localStorage:', e);
    }

    supabaseInstance = null;
    return initClient();
  };

  /**
   * Menghapus konfigurasi dari localStorage
   */
  const clearConfig = () => {
    try {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
    } catch (e) {}
    supabaseInstance = null;
  };

  /**
   * Memeriksa apakah konfigurasi Supabase telah terpasang dengan valid
   */
  const isConfigured = () => {
    const { url, anonKey } = getConfig();
    return Boolean(
      url &&
      anonKey &&
      url.startsWith('https://') &&
      !url.includes('xxxxxxxxxx') &&
      anonKey.length > 20
    );
  };

  /**
   * Menginisialisasi instance Supabase JS Client
   */
  const initClient = () => {
    if (supabaseInstance) return supabaseInstance;

    if (typeof window === 'undefined' || typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('MathVerse: Library @supabase/supabase-js belum termuat dari CDN.');
      return null;
    }

    const { url, anonKey } = getConfig();
    if (!url || !anonKey) {
      return null;
    }

    try {
      supabaseInstance = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.error('MathVerse: Gagal menginisialisasi Supabase client:', err);
      return null;
    }
  };

  /**
   * Memulai sesi permainan resmi server
   * RPC: public.start_game_session(TEXT, TEXT, TEXT, TEXT, INT)
   */
  const startGameSession = async ({ playerName, school = 'Pelajar SMA', topicId = 'all', difficulty = 'all', questionCount = 10 }) => {
    const client = initClient();
    if (!client) {
      return {
        success: false,
        error: 'Koneksi ke database Supabase belum terkonfigurasi. Silakan isi URL dan Public Anon Key di pengaturan.'
      };
    }

    try {
      const { data, error } = await client.rpc('start_game_session', {
        p_player_name: playerName,
        p_school: school || 'Pelajar SMA',
        p_topic_id: topicId || 'all',
        p_difficulty: difficulty || 'all',
        p_question_count: questionCount || 10
      });

      if (error) {
        console.error('start_game_session error:', error);
        return {
          success: false,
          error: error.message || error.details || 'Gagal memulai sesi di server.'
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: (data && data.error) || 'Respon server tidak valid saat memulai sesi permainan.'
        };
      }

      return data;
    } catch (err) {
      console.error('Network exception in startGameSession:', err);
      return {
        success: false,
        error: err.message || 'Terjadi gangguan jaringan saat menghubungi server Supabase.'
      };
    }
  };

  /**
   * Mengirim jawaban dan memvalidasi skor resmi di server
   * RPC: public.submit_game_session(UUID, TEXT, JSONB)
   */
  const submitGameSession = async ({ sessionId, sessionToken, answers = [] }) => {
    const client = initClient();
    if (!client) {
      return {
        success: false,
        error: 'Klien Supabase tidak tersedia saat pengiriman.'
      };
    }

    if (!sessionId || !sessionToken) {
      return {
        success: false,
        error: 'ID Sesi atau Token Sesi tidak ditemukan. Tidak dapat mengirimkan sesi tanpa identitas resmi.'
      };
    }

    try {
      const { data, error } = await client.rpc('submit_game_session', {
        p_session_id: sessionId,
        p_session_token: sessionToken,
        p_answers: answers
      });

      if (error) {
        console.error('submit_game_session error:', error);
        return {
          success: false,
          error: error.message || error.details || 'Gagal menyimpan dan memvalidasi hasil sesi di server.'
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: (data && (data.message || data.error)) || 'Server menolak pengiriman sesi.'
        };
      }

      return data;
    } catch (err) {
      console.error('Network exception in submitGameSession:', err);
      return {
        success: false,
        error: err.message || 'Terjadi gangguan jaringan saat menyimpan hasil ke Supabase.'
      };
    }
  };

  /**
   * Mengambil data leaderboard resmi dari database
   * RPC: public.get_leaderboard(INT, BOOLEAN)
   */
  const getLeaderboard = async ({ limit = 15, includeMock = false } = {}) => {
    const client = initClient();
    if (!client) {
      return {
        success: false,
        data: [],
        error: 'Supabase belum dikonfigurasi. Isi URL & Public Anon Key untuk melihat leaderboard bersama.'
      };
    }

    try {
      const { data, error } = await client.rpc('get_leaderboard', {
        p_limit: limit,
        p_include_mock: includeMock
      });

      if (error) {
        console.error('get_leaderboard error:', error);
        return {
          success: false,
          data: [],
          error: error.message || error.details || 'Gagal memuat papan peringkat dari server.'
        };
      }

      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (err) {
      console.error('Network exception in getLeaderboard:', err);
      return {
        success: false,
        data: [],
        error: err.message || 'Terjadi kesalahan jaringan saat memuat papan peringkat.'
      };
    }
  };

  /**
   * Mengambil data kurikulum topik pembelajaran dari Supabase (jika tersedia)
   */
  const getTopics = async () => {
    const client = initClient();
    if (!client) {
      return { success: false, data: [], error: 'Klien Supabase belum terkonfigurasi.' };
    }

    try {
      const { data, error } = await client
        .from('topics')
        .select('*')
        .order('chapter_number', { ascending: true });

      if (error) {
        console.warn('MathVerse Supabase getTopics warning:', error);
        return { success: false, data: [], error: error.message };
      }

      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (err) {
      console.warn('Network exception in getTopics:', err);
      return { success: false, data: [], error: err.message };
    }
  };

  /**
   * Menguji koneksi aktif ke Supabase
   */
  const testConnection = async () => {
    if (!isConfigured()) {
      return { ok: false, message: 'URL atau Public Anon Key belum diisi lengkap.' };
    }
    const res = await getLeaderboard({ limit: 1, includeMock: false });
    if (res.success) {
      return { ok: true, message: 'Koneksi ke Supabase dan fungsi RPC berhasil!' };
    }
    return { ok: false, message: res.error || 'Gagal terhubung ke RPC Supabase.' };
  };

  return {
    getConfig,
    saveConfig,
    clearConfig,
    isConfigured,
    initClient,
    startGameSession,
    submitGameSession,
    getLeaderboard,
    getTopics,
    testConnection
  };
})();

if (typeof window !== 'undefined') {
  window.MathVerseSupabase = MathVerseSupabase;
}
