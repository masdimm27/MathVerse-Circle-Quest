-- ============================================================================
-- MathVerse — Circle Quest: Hardened Supabase Database Migration & Security Schema (v2)
-- File: supabase/migrations/20261025010000_hardened_mathverse_security_schema.sql
-- (Idempoten, Role-Based Access Control Granular, Two-Phase Anti-Cheat, Non-Recursive RLS)
-- ============================================================================

-- 0. EKSTENSI & CLEANUP AWAL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABEL: admin_users (Manajemen Hak Akses Staf Pengajar & Administrator)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('superadmin', 'admin', 'teacher')),
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS 'Daftar pengguna dengan hak istimewa (superadmin, admin, teacher).';
COMMENT ON COLUMN public.admin_users.role IS 'superadmin: kendali penuh & kelola admin; admin: kelola bank soal & kurikulum; teacher: tinjau hasil siswa & materi.';

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Penanganan Idempotensi Kebijakan RLS admin_users
DROP POLICY IF EXISTS "admin_users_select_self_or_service" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_superadmin_manage" ON public.admin_users;
DROP POLICY IF EXISTS "Pengguna dapat membaca data admin diri sendiri" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmin dan service role dapat mengelola admin_users" ON public.admin_users;

-- RLS SELECT: Pengguna dapat membaca status dirinya sendiri, ATAU service_role / JWT admin
-- (CATATAN: Kebijakan ini murni menggunakan perbandingan kolom & klaim JWT tanpa memanggil fungsi kustom agar bebas rekursi)
CREATE POLICY "admin_users_select_self_or_service"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        OR coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') IN ('admin', 'superadmin')
    );

-- RLS ALL: Hanya service_role atau superadmin di app_metadata yang dapat mengubah tabel admin secara langsung
CREATE POLICY "admin_users_superadmin_manage"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (
        coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        OR coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'superadmin'
    )
    WITH CHECK (
        coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        OR coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'superadmin'
    );

-- ============================================================================
-- 2. FUNGSI HAK AKSES BERBASIS PERAN (Granular RBAC Helpers)
-- ============================================================================

-- A. Dapatkan Peran Pengguna Saat Ini
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- 1. Service role (Backend / CLI / Admin Supabase Studio)
    IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
        RETURN 'superadmin';
    END IF;

    -- 2. Klaim JWT app_metadata
    v_role := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
    IF v_role IN ('superadmin', 'admin', 'teacher') THEN
        RETURN v_role;
    END IF;

    -- 3. Pencarian langsung pada tabel admin_users
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_role
        FROM public.admin_users
        WHERE user_id = auth.uid();

        IF FOUND THEN
            RETURN v_role;
        END IF;
        RETURN 'student';
    END IF;

    RETURN 'anon';
END;
$$;

-- B. Cek Hak Superadmin (Kendali Penuh, Manajemen Staf, Purge Data)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT public.get_current_user_role() = 'superadmin';
$$;

-- C. Cek Hak Admin (Kelola Soal, Topik Materi, Konfigurasi Pembelajaran)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT public.get_current_user_role() IN ('superadmin', 'admin');
$$;

-- D. Cek Hak Staf Pengajar / Teacher (Membaca Solusi Soal, Memantau Nilai Siswa)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT public.get_current_user_role() IN ('superadmin', 'admin', 'teacher');
$$;

-- ============================================================================
-- 3. PROSEDUR BOOTSTRAP SUPERADMIN PERTAMA YANG AMAN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(
    p_target_user_id UUID,
    p_full_name TEXT DEFAULT 'Administrator Utama',
    p_bootstrap_secret TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_target_email TEXT;
    v_existing_admin_count INT;
    v_configured_secret TEXT;
BEGIN
    -- 1. Proteksi Race Condition dengan Eksklusif Table Lock
    LOCK TABLE public.admin_users IN EXCLUSIVE MODE;

    SELECT count(*) INTO v_existing_admin_count FROM public.admin_users;
    IF v_existing_admin_count > 0 THEN
        RAISE EXCEPTION 'Bootstrap ditolak: Administrator pertama sudah terdaftar. Gunakan akun superadmin yang ada untuk menambah staf baru.';
    END IF;

    -- 2. Validasi Kunci Rahasia Bootstrap jika Dikonfigurasi di Database Settings
    v_configured_secret := nullif(current_setting('app.settings.bootstrap_secret', true), '');
    IF v_configured_secret IS NOT NULL THEN
        IF p_bootstrap_secret IS NULL OR p_bootstrap_secret != v_configured_secret THEN
            RAISE EXCEPTION 'Akses ditolak: Kunci rahasia bootstrap tidak sesuai.';
        END IF;
    END IF;

    -- 3. Verifikasi Akun Pengguna Terdaftar di Supabase Auth
    SELECT email INTO v_target_email
    FROM auth.users
    WHERE id = p_target_user_id;

    IF v_target_email IS NULL THEN
        RAISE EXCEPTION 'Akun auth.users dengan ID % tidak ditemukan.', p_target_user_id;
    END IF;

    -- 4. Masukkan Pengguna Sebagai Superadmin Pertama
    INSERT INTO public.admin_users (user_id, role, email, full_name)
    VALUES (p_target_user_id, 'superadmin', v_target_email, p_full_name)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = 'superadmin', full_name = EXCLUDED.full_name, updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Bootstrap superadmin berhasil diinisialisasi.',
        'user_id', p_target_user_id,
        'email', v_target_email,
        'role', 'superadmin'
    );
END;
$$;

COMMENT ON FUNCTION public.bootstrap_first_admin(UUID, TEXT, TEXT) IS 'Inisialisasi terkendali untuk akun superadmin pertama saat tabel admin_users masih kosong.';

-- ============================================================================
-- 4. TABEL: topics (8 Bab Kurikulum Geometri Lingkaran SMA Fase F)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    chapter_number INT NOT NULL UNIQUE CHECK (chapter_number BETWEEN 1 AND 8),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    formula_summary TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.topics IS '8 Bab kurikulum pembelajaran geometri lingkaran Fase F SMA.';

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topics_public_select" ON public.topics;
DROP POLICY IF EXISTS "topics_admin_manage" ON public.topics;
DROP POLICY IF EXISTS "Semua orang dapat membaca data topik" ON public.topics;
DROP POLICY IF EXISTS "Hanya admin yang dapat mengelola topik" ON public.topics;

-- Semua pengunjung & siswa dapat membaca materi
CREATE POLICY "topics_public_select"
    ON public.topics
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Hanya Admin dan Superadmin yang dapat memodifikasi bab kurikulum (Teacher tidak memiliki izin edit)
CREATE POLICY "topics_admin_manage"
    ON public.topics
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. TABEL: questions (Bank Soal Publik - Tanpa Kunci Jawaban)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    topic_title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('mudah', 'sedang', 'sulit')),
    difficulty_label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'choice' CHECK (type IN ('choice', 'numeric')),
    question TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    unit TEXT DEFAULT '',
    hint TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.questions IS 'Koleksi soal kuis publik yang dapat dibaca pemain tanpa membocorkan kunci jawaban.';

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_public_select" ON public.questions;
DROP POLICY IF EXISTS "questions_admin_manage" ON public.questions;
DROP POLICY IF EXISTS "Peserta dapat membaca soal aktif" ON public.questions;
DROP POLICY IF EXISTS "Hanya admin yang dapat memodifikasi soal" ON public.questions;

-- Siswa dan anon hanya dapat membaca soal yang berstatus aktif. Staf dapat melihat semua.
CREATE POLICY "questions_public_select"
    ON public.questions
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR public.is_staff());

-- Hanya Admin dan Superadmin yang dapat menambah, mengubah, atau menghapus soal
CREATE POLICY "questions_admin_manage"
    ON public.questions
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 6. TABEL: question_solutions (Kunci Jawaban Rahasia & Pembahasan)
-- CATATAN KEAMANAN: Terisolasi dari akses publik, anon, dan peserta kuis!
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_solutions (
    question_id TEXT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_answer INT CHECK (correct_answer >= 0),
    correct_numeric NUMERIC(12, 4),
    tolerance NUMERIC(8, 4) DEFAULT 0.2000,
    formula_reference TEXT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.question_solutions IS 'Kunci jawaban rahasia, formula, dan pembahasan terperinci.';

ALTER TABLE public.question_solutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_solutions_staff_select" ON public.question_solutions;
DROP POLICY IF EXISTS "question_solutions_admin_manage" ON public.question_solutions;
DROP POLICY IF EXISTS "Hanya admin yang dapat mengakses kunci jawaban rahasia" ON public.question_solutions;
DROP POLICY IF EXISTS "Hanya admin yang dapat mengakses kunci jawaban" ON public.question_solutions;

-- Staf (teacher, admin, superadmin) diizinkan membaca kunci solusi untuk kebutuhan review/pembahasan
CREATE POLICY "question_solutions_staff_select"
    ON public.question_solutions
    FOR SELECT
    TO authenticated
    USING (public.is_staff());

-- Hanya Admin dan Superadmin yang dapat mengubah atau menginput kunci solusi
CREATE POLICY "question_solutions_admin_manage"
    ON public.question_solutions
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. TABEL: mock_leaderboard (Papan Peringkat Simulasi Terpisah)
-- CATATAN: Memiliki batasan unik deterministik agar tidak menggandakan data saat re-run
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mock_leaderboard (
    id UUID PRIMARY KEY,
    player_name TEXT NOT NULL CHECK (char_length(trim(player_name)) BETWEEN 2 AND 50),
    school TEXT NOT NULL DEFAULT 'Pelajar SMA',
    title TEXT NOT NULL,
    xp INT NOT NULL CHECK (xp >= 0),
    accuracy NUMERIC(5, 2) NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_mock_leaderboard_player_school UNIQUE (player_name, school)
);

COMMENT ON TABLE public.mock_leaderboard IS 'Data simulasi papan peringkat awal untuk tampilan demo. Terpisah penuh dari sesi riil peserta.';

ALTER TABLE public.mock_leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mock_leaderboard_public_select" ON public.mock_leaderboard;
DROP POLICY IF EXISTS "mock_leaderboard_admin_manage" ON public.mock_leaderboard;
DROP POLICY IF EXISTS "Publik dapat membaca mock leaderboard" ON public.mock_leaderboard;
DROP POLICY IF EXISTS "Hanya admin yang dapat mengelola mock leaderboard" ON public.mock_leaderboard;

CREATE POLICY "mock_leaderboard_public_select"
    ON public.mock_leaderboard
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "mock_leaderboard_admin_manage"
    ON public.mock_leaderboard
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 8. TABEL: game_sessions (Hasil Permainan Riil Peserta - Siklus Dua Fase)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL CHECK (char_length(trim(player_name)) BETWEEN 2 AND 50),
    school TEXT NOT NULL DEFAULT 'Pelajar SMA',
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL DEFAULT 'all',
    expected_question_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_questions INT NOT NULL CHECK (total_questions > 0),
    correct_count INT NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
    wrong_count INT NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
    accuracy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (accuracy_percentage BETWEEN 0 AND 100),
    score_xp INT NOT NULL DEFAULT 0 CHECK (score_xp >= 0),
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    title_awarded TEXT NOT NULL DEFAULT 'Penjelajah Lingkaran',
    session_answers JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.game_sessions IS 'Catatan resmi riwayat sesi permainan peserta (100% data riil terverifikasi).';

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_sessions_select_owner_or_staff" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_superadmin_manage" ON public.game_sessions;
DROP POLICY IF EXISTS "Pengguna dapat membaca sesi miliknya sendiri" ON public.game_sessions;
DROP POLICY IF EXISTS "Hanya admin yang dapat mengubah sesi" ON public.game_sessions;
DROP POLICY IF EXISTS "Hanya admin yang dapat menghapus riwayat sesi" ON public.game_sessions;

-- Peserta hanya dapat melihat sesinya sendiri. Staf pengajar/admin dapat memantau seluruh sesi siswa.
CREATE POLICY "game_sessions_select_owner_or_staff"
    ON public.game_sessions
    FOR SELECT
    TO authenticated
    USING (
        (auth.uid() = user_id)
        OR public.is_staff()
    );

-- Hanya Superadmin yang dapat menghapus atau mengubah rekaman sesi permainan (misal pembersihan audit)
CREATE POLICY "game_sessions_superadmin_manage"
    ON public.game_sessions
    FOR ALL
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());

-- ============================================================================
-- 9. TABEL: learning_progress (Pelacakan Capaian Belajar 8 Bab Materi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id INT NOT NULL CHECK (chapter_id BETWEEN 1 AND 8),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, chapter_id)
);

COMMENT ON TABLE public.learning_progress IS 'Pencatatan status penyelesaian 8 bab materi pembelajaran per siswa.';

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_progress_select" ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_insert" ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_delete" ON public.learning_progress;
DROP POLICY IF EXISTS "Siswa dapat melihat progres belajarnya sendiri" ON public.learning_progress;
DROP POLICY IF EXISTS "Siswa dapat menandai atau mencabut status selesai bab miliknya" ON public.learning_progress;
DROP POLICY IF EXISTS "Siswa dapat menghapus progres belajarnya sendiri" ON public.learning_progress;

-- Siswa melihat miliknya sendiri; Staf (teacher/admin) dapat memantau progres belajar seluruh siswa
CREATE POLICY "learning_progress_select"
    ON public.learning_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "learning_progress_insert"
    ON public.learning_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_progress_delete"
    ON public.learning_progress
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_superadmin());

-- ============================================================================
-- 10. INDEKS UNTUK OPTIMASI PERFORMA KUERI TINGGI
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_topic_diff_active ON public.questions(topic_id, difficulty, is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_leaderboard ON public.game_sessions(score_xp DESC, duration_seconds ASC, created_at ASC) WHERE status = 'completed' AND score_xp > 0;
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_status ON public.game_sessions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_token_lookup ON public.game_sessions(id, session_token);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON public.learning_progress(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- ============================================================================
-- 11. VIEW: leaderboard_public (Papan Peringkat Publik Riil)
-- ============================================================================
CREATE OR REPLACE VIEW public.leaderboard_public
AS
SELECT
    id AS session_id,
    player_name,
    school,
    title_awarded AS title,
    score_xp AS xp,
    accuracy_percentage,
    duration_seconds,
    created_at
FROM public.game_sessions
WHERE status = 'completed' AND score_xp > 0
ORDER BY score_xp DESC, duration_seconds ASC, created_at ASC;

COMMENT ON VIEW public.leaderboard_public IS 'Papan peringkat publik yang menampilkan data riil peserta tanpa membocorkan identitas sensitif.';

-- ============================================================================
-- 12. RPC: get_leaderboard
-- Mengambil papan peringkat dengan opsi penggabungan data demo jika tabel riil masih sepi.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_limit INT DEFAULT 10,
    p_include_mock BOOLEAN DEFAULT false
)
RETURNS TABLE (
    rank BIGINT,
    player_name TEXT,
    school TEXT,
    title TEXT,
    xp INT,
    accuracy NUMERIC,
    duration INT,
    is_mock BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH combined_board AS (
        SELECT
            gs.player_name,
            gs.school,
            gs.title_awarded AS title,
            gs.score_xp AS xp,
            gs.accuracy_percentage AS accuracy,
            gs.duration_seconds AS duration,
            false AS is_mock,
            gs.created_at
        FROM public.game_sessions gs
        WHERE gs.status = 'completed' AND gs.score_xp > 0

        UNION ALL

        SELECT
            mb.player_name,
            mb.school,
            mb.title,
            mb.xp,
            mb.accuracy,
            mb.duration_seconds AS duration,
            true AS is_mock,
            mb.created_at
        FROM public.mock_leaderboard mb
        WHERE p_include_mock IS TRUE
    )
    SELECT
        row_number() OVER (ORDER BY xp DESC, duration ASC, created_at ASC) AS rank,
        player_name,
        school,
        title,
        xp,
        accuracy,
        duration,
        is_mock,
        created_at
    FROM combined_board
    ORDER BY xp DESC, duration ASC, created_at ASC
    LIMIT greatest(1, least(p_limit, 100));
$$;

COMMENT ON FUNCTION public.get_leaderboard(INT, BOOLEAN) IS 'Mengambil top papan peringkat secara aman dan efisien.';

-- ============================================================================
-- 13. SIKLUS SESI BERIKUTNYA (FASE 1): start_game_session
-- Server memilihkan daftar soal acak dan menerbitkan session token resmi
-- ============================================================================
CREATE OR REPLACE FUNCTION public.start_game_session(
    p_player_name TEXT,
    p_school TEXT DEFAULT 'Pelajar SMA',
    p_topic_id TEXT DEFAULT 'all',
    p_difficulty TEXT DEFAULT 'all',
    p_question_count INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_clean_name TEXT;
    v_clean_school TEXT;
    v_user_id UUID;
    v_session_id UUID;
    v_session_token TEXT;
    v_target_count INT;
    v_selected_ids TEXT[];
    v_client_questions JSONB := '[]'::jsonb;
    v_q RECORD;
BEGIN
    -- 1. Validasi Masukan Nama Pemain
    v_clean_name := trim(regexp_replace(coalesce(p_player_name, ''), '[\r\n\t]+', ' ', 'g'));
    IF char_length(v_clean_name) < 2 OR char_length(v_clean_name) > 30 THEN
        RAISE EXCEPTION 'Nama pemain tidak valid. Panjang nama harus antara 2 hingga 30 karakter.';
    END IF;

    v_clean_school := trim(regexp_replace(coalesce(p_school, 'Pelajar SMA'), '[\r\n\t]+', ' ', 'g'));
    IF v_clean_school = '' THEN
        v_clean_school := 'Pelajar SMA';
    ELSIF char_length(v_clean_school) > 60 THEN
        v_clean_school := substring(v_clean_school FROM 1 FOR 60);
    END IF;

    v_user_id := auth.uid();
    v_target_count := greatest(1, least(coalesce(p_question_count, 10), 20));

    -- 2. Cegah Spam Pembuatan Sesi Terlalu Cepat (Cooldown 5 Detik)
    IF v_user_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.game_sessions
            WHERE user_id = v_user_id AND started_at > (now() - INTERVAL '5 seconds')
        ) THEN
            RAISE EXCEPTION 'Terlalu cepat: Harap tunggu beberapa detik sebelum memulai sesi baru.';
        END IF;
    ELSE
        IF EXISTS (
            SELECT 1 FROM public.game_sessions
            WHERE user_id IS NULL AND player_name = v_clean_name AND started_at > (now() - INTERVAL '5 seconds')
        ) THEN
            RAISE EXCEPTION 'Terlalu cepat: Harap tunggu beberapa detik sebelum memulai sesi baru.';
        END IF;
    END IF;

    -- 3. Pilih Kumpulan Soal Aktif dari Server secara Acak Sesuai Kategori
    SELECT array_agg(q.id)
    INTO v_selected_ids
    FROM (
        SELECT id
        FROM public.questions
        WHERE is_active = true
          AND (p_topic_id = 'all' OR topic_id = p_topic_id)
          AND (p_difficulty = 'all' OR difficulty = p_difficulty)
        ORDER BY random()
        LIMIT v_target_count
    ) q;

    IF v_selected_ids IS NULL OR array_length(v_selected_ids, 1) = 0 THEN
        RAISE EXCEPTION 'Tidak ditemukan soal aktif untuk kategori dan tingkat kesulitan yang dipilih.';
    END IF;

    -- 4. Terbitkan Token Sesi Kriptografis
    v_session_token := encode(gen_random_bytes(24), 'hex');

    -- 5. Rekam Sesi Awal Berstatus 'in_progress'
    INSERT INTO public.game_sessions (
        session_token,
        status,
        user_id,
        player_name,
        school,
        topic_id,
        difficulty,
        expected_question_ids,
        total_questions,
        started_at
    ) VALUES (
        v_session_token,
        'in_progress',
        v_user_id,
        v_clean_name,
        v_clean_school,
        nullif(p_topic_id, 'all'),
        p_difficulty,
        v_selected_ids,
        array_length(v_selected_ids, 1),
        now()
    )
    RETURNING id INTO v_session_id;

    -- 6. Susun Daftar Soal Publik untuk Klien (Hanya Soal & Pilihan, Kunci Tetap Terkunci)
    FOR v_q IN 
        SELECT id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint
        FROM public.questions
        WHERE id = ANY(v_selected_ids)
    LOOP
        v_client_questions := v_client_questions || jsonb_build_object(
            'id', v_q.id,
            'topic_id', v_q.topic_id,
            'topic_title', v_q.topic_title,
            'difficulty', v_q.difficulty,
            'difficulty_label', v_q.difficulty_label,
            'type', v_q.type,
            'question', v_q.question,
            'options', v_q.options,
            'unit', v_q.unit,
            'hint', v_q.hint
        );
    END LOOP;

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'session_token', v_session_token,
        'player_name', v_clean_name,
        'total_questions', array_length(v_selected_ids, 1),
        'questions', v_client_questions
    );
END;
$$;

COMMENT ON FUNCTION public.start_game_session(TEXT, TEXT, TEXT, TEXT, INT) IS 'Menginisialisasi sesi permainan di server dan menerbitkan token sesi aman.';

-- ============================================================================
-- 14. SIKLUS SESI BERIKUTNYA (FASE 2): submit_game_session (Validasi Server-Side)
-- ============================================================================

-- Versi 1 (Rekomendasi Utama: Terikat Token Sesi Server)
CREATE OR REPLACE FUNCTION public.submit_game_session(
    p_session_id UUID,
    p_session_token TEXT,
    p_answers JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_session RECORD;
    v_server_duration INT;
    v_min_duration_required INT;
    v_valid_count INT := 0;
    v_correct_count INT := 0;
    v_wrong_count INT := 0;
    v_total_xp INT := 0;
    v_accuracy NUMERIC(5, 2) := 0;
    v_title TEXT;
    v_answer_record JSONB;
    v_q_id TEXT;
    v_user_ans TEXT;
    v_q_record RECORD;
    v_is_correct BOOLEAN;
    v_earned_xp INT;
    v_review_list JSONB := '[]'::jsonb;
    v_seen_ids TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Kunci dan Ambil Data Sesi yang Berjalan
    SELECT *
    INTO v_session
    FROM public.game_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesi permainan dengan ID % tidak ditemukan.', p_session_id;
    END IF;

    -- Validasi Token Sesi Rahasia
    IF v_session.session_token != p_session_token THEN
        RAISE EXCEPTION 'Akses ditolak: Token sesi tidak cocok atau tidak valid.';
    END IF;

    -- Pastikan Sesi Belum Pernah Diselesaikan Sebelumnya (Anti-Replay)
    IF v_session.status != 'in_progress' THEN
        RAISE EXCEPTION 'Sesi permainan ini sudah pernah dikirimkan atau ditutup sebelumnya.';
    END IF;

    -- 2. Hitung Durasi Pengerjaan Nyata Berdasarkan Jam Server (Anti-Manipulasi Waktu Klien)
    v_server_duration := greatest(0, floor(extract(epoch from (now() - v_session.started_at)))::int);

    -- Proteksi Human Realism: Minimal durasi 1 detik per butir soal matematika
    v_min_duration_required := v_session.total_questions * 1;
    IF v_server_duration < v_min_duration_required THEN
        RAISE EXCEPTION 'Pengiriman ditolak: Durasi server (% detik) tidak realistis untuk % butir soal geometri.',
            v_server_duration, v_session.total_questions;
    END IF;

    -- Batas Maksimal Sesi (2 Jam)
    IF v_server_duration > 7200 THEN
        UPDATE public.game_sessions SET status = 'abandoned' WHERE id = p_session_id;
        RAISE EXCEPTION 'Sesi telah kedaluwarsa (lebih dari 2 jam). Silakan mulai sesi permainan baru.';
    END IF;

    -- 3. Evaluasi Jawaban Terhadap Kunci Rahasia
    FOR v_answer_record IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := trim(coalesce(v_answer_record ->> 'question_id', ''));
        v_user_ans := trim(coalesce(v_answer_record ->> 'user_answer', ''));

        -- Hanya proses soal yang terdaftar pada expected_question_ids sesi ini
        IF v_q_id = '' OR v_q_id = ANY(v_seen_ids) OR NOT (v_q_id = ANY(v_session.expected_question_ids)) THEN
            CONTINUE;
        END IF;
        v_seen_ids := array_append(v_seen_ids, v_q_id);

        SELECT 
            q.id, q.topic_title, q.difficulty, q.type, q.options, q.unit,
            qs.correct_answer, qs.correct_numeric, qs.tolerance, qs.formula_reference, qs.explanation
        INTO v_q_record
        FROM public.questions q
        JOIN public.question_solutions qs ON qs.question_id = q.id
        WHERE q.id = v_q_id AND q.is_active = true;

        IF FOUND THEN
            v_valid_count := v_valid_count + 1;
            v_is_correct := false;
            v_earned_xp := 0;

            -- Evaluasi Pilihan Ganda
            IF v_q_record.type = 'choice' THEN
                IF v_user_ans ~ '^[0-9]+$' THEN
                    IF (v_user_ans::int >= 0) AND (v_user_ans::int < jsonb_array_length(v_q_record.options)) THEN
                        IF v_user_ans::int = v_q_record.correct_answer THEN
                            v_is_correct := true;
                        END IF;
                    END IF;
                END IF;

            -- Evaluasi Numerik
            ELSIF v_q_record.type = 'numeric' THEN
                BEGIN
                    IF abs((replace(v_user_ans, ',', '.')::numeric) - v_q_record.correct_numeric) <= coalesce(v_q_record.tolerance, 0.2000) THEN
                        v_is_correct := true;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    v_is_correct := false;
                END;
            END IF;

            -- Bobot Nilai XP Kurikulum
            IF v_is_correct THEN
                IF v_q_record.difficulty = 'mudah' THEN v_earned_xp := 100;
                ELSIF v_q_record.difficulty = 'sedang' THEN v_earned_xp := 150;
                ELSIF v_q_record.difficulty = 'sulit' THEN v_earned_xp := 200;
                ELSE v_earned_xp := 100;
                END IF;

                v_correct_count := v_correct_count + 1;
                v_total_xp := v_total_xp + v_earned_xp;
            ELSE
                v_wrong_count := v_wrong_count + 1;
            END IF;

            v_review_list := v_review_list || jsonb_build_object(
                'question_id', v_q_record.id,
                'topic_title', v_q_record.topic_title,
                'is_correct', v_is_correct,
                'earned_xp', v_earned_xp,
                'user_answer', v_user_ans,
                'correct_answer_display', CASE 
                    WHEN v_q_record.type = 'choice' THEN (v_q_record.options ->> v_q_record.correct_answer)
                    ELSE concat(v_q_record.correct_numeric, ' ', coalesce(v_q_record.unit, ''))
                END,
                'formula_reference', v_q_record.formula_reference,
                'explanation', v_q_record.explanation
            );
        END IF;
    END LOOP;

    IF v_valid_count = 0 THEN
        RAISE EXCEPTION 'Evaluasi gagal: Tidak ada soal terdaftar yang berhasil divalidasi.';
    END IF;

    -- Hitung Akurasi & Gelar Kehormatan
    v_accuracy := round((v_correct_count::numeric / v_valid_count::numeric) * 100, 2);
    IF v_accuracy >= 90 THEN v_title := 'Grandmaster Geometri';
    ELSIF v_accuracy >= 75 THEN v_title := 'Master Lingkaran';
    ELSIF v_accuracy >= 60 THEN v_title := 'Ksatria Geometri';
    ELSE v_title := 'Penjelajah Lingkaran';
    END IF;

    -- 4. Tutup Sesi dan Simpan Hasil Akhir
    UPDATE public.game_sessions
    SET 
        status = 'completed',
        correct_count = v_correct_count,
        wrong_count = (v_valid_count - v_correct_count),
        total_questions = v_valid_count,
        accuracy_percentage = v_accuracy,
        score_xp = v_total_xp,
        duration_seconds = v_server_duration,
        title_awarded = v_title,
        session_answers = v_review_list,
        completed_at = now()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
        'session_id', p_session_id,
        'player_name', v_session.player_name,
        'total_questions', v_valid_count,
        'correct_count', v_correct_count,
        'wrong_count', (v_valid_count - v_correct_count),
        'accuracy_percentage', v_accuracy,
        'score_xp', v_total_xp,
        'duration_seconds', v_server_duration,
        'title_awarded', v_title,
        'reviews', v_review_list
    );
END;
$$;

-- Versi 2 (Overload Kompatibilitas untuk Klien yang Mengirimkan Jawaban Sekaligus di Akhir)
CREATE OR REPLACE FUNCTION public.submit_game_session(
    p_player_name TEXT,
    p_school TEXT DEFAULT 'Pelajar SMA',
    p_topic_id TEXT DEFAULT 'all',
    p_difficulty TEXT DEFAULT 'all',
    p_duration_seconds INT DEFAULT 0,
    p_answers JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_clean_name TEXT;
    v_clean_school TEXT;
    v_user_id UUID;
    v_submitted_count INT;
    v_valid_count INT := 0;
    v_correct_count INT := 0;
    v_wrong_count INT := 0;
    v_total_xp INT := 0;
    v_accuracy NUMERIC(5, 2) := 0;
    v_title TEXT;
    v_session_id UUID;
    v_session_token TEXT;
    v_answer_record JSONB;
    v_q_id TEXT;
    v_user_ans TEXT;
    v_q_record RECORD;
    v_is_correct BOOLEAN;
    v_earned_xp INT;
    v_review_list JSONB := '[]'::jsonb;
    v_seen_ids TEXT[] := ARRAY[]::TEXT[];
    v_min_duration_required INT;
BEGIN
    v_clean_name := trim(regexp_replace(coalesce(p_player_name, ''), '[\r\n\t]+', ' ', 'g'));
    IF char_length(v_clean_name) < 2 OR char_length(v_clean_name) > 30 THEN
        RAISE EXCEPTION 'Nama pemain tidak valid (harus 2-30 karakter).';
    END IF;

    v_clean_school := trim(regexp_replace(coalesce(p_school, 'Pelajar SMA'), '[\r\n\t]+', ' ', 'g'));
    IF v_clean_school = '' THEN v_clean_school := 'Pelajar SMA';
    ELSIF char_length(v_clean_school) > 60 THEN v_clean_school := substring(v_clean_school FROM 1 FOR 60);
    END IF;

    IF p_duration_seconds < 0 OR p_duration_seconds > 7200 THEN
        RAISE EXCEPTION 'Durasi permainan tidak valid.';
    END IF;

    v_submitted_count := jsonb_array_length(p_answers);
    IF v_submitted_count < 1 OR v_submitted_count > 25 THEN
        RAISE EXCEPTION 'Jumlah butir soal tidak valid (1-25 soal).';
    END IF;

    v_min_duration_required := v_submitted_count * 1;
    IF p_duration_seconds < v_min_duration_required THEN
        RAISE EXCEPTION 'Pengiriman ditolak: Durasi penyelesaian (% detik) tidak realistis.', p_duration_seconds;
    END IF;

    v_user_id := auth.uid();
    IF v_user_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.game_sessions
            WHERE user_id = v_user_id AND created_at > (now() - INTERVAL '5 seconds')
        ) THEN
            RAISE EXCEPTION 'Terlalu cepat: Harap tunggu beberapa saat sebelum mengirim kuis baru.';
        END IF;
    ELSE
        IF EXISTS (
            SELECT 1 FROM public.game_sessions
            WHERE user_id IS NULL AND player_name = v_clean_name AND created_at > (now() - INTERVAL '5 seconds')
        ) THEN
            RAISE EXCEPTION 'Terlalu cepat: Harap tunggu beberapa saat sebelum mengirim kuis baru.';
        END IF;
    END IF;

    FOR v_answer_record IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := trim(coalesce(v_answer_record ->> 'question_id', ''));
        v_user_ans := trim(coalesce(v_answer_record ->> 'user_answer', ''));

        IF v_q_id = '' OR v_q_id = ANY(v_seen_ids) THEN CONTINUE; END IF;
        v_seen_ids := array_append(v_seen_ids, v_q_id);

        SELECT 
            q.id, q.topic_id, q.topic_title, q.difficulty, q.type, q.options, q.unit,
            qs.correct_answer, qs.correct_numeric, qs.tolerance, qs.formula_reference, qs.explanation
        INTO v_q_record
        FROM public.questions q
        JOIN public.question_solutions qs ON qs.question_id = q.id
        WHERE q.id = v_q_id AND q.is_active = true;

        IF FOUND THEN
            IF coalesce(p_topic_id, 'all') != 'all' AND v_q_record.topic_id != p_topic_id THEN CONTINUE; END IF;
            IF coalesce(p_difficulty, 'all') != 'all' AND v_q_record.difficulty != p_difficulty THEN CONTINUE; END IF;

            v_valid_count := v_valid_count + 1;
            v_is_correct := false;
            v_earned_xp := 0;

            IF v_q_record.type = 'choice' THEN
                IF v_user_ans ~ '^[0-9]+$' THEN
                    IF (v_user_ans::int >= 0) AND (v_user_ans::int < jsonb_array_length(v_q_record.options)) THEN
                        IF v_user_ans::int = v_q_record.correct_answer THEN v_is_correct := true; END IF;
                    END IF;
                END IF;
            ELSIF v_q_record.type = 'numeric' THEN
                BEGIN
                    IF abs((replace(v_user_ans, ',', '.')::numeric) - v_q_record.correct_numeric) <= coalesce(v_q_record.tolerance, 0.2000) THEN
                        v_is_correct := true;
                    END IF;
                EXCEPTION WHEN OTHERS THEN v_is_correct := false;
                END;
            END IF;

            IF v_is_correct THEN
                IF v_q_record.difficulty = 'mudah' THEN v_earned_xp := 100;
                ELSIF v_q_record.difficulty = 'sedang' THEN v_earned_xp := 150;
                ELSIF v_q_record.difficulty = 'sulit' THEN v_earned_xp := 200;
                ELSE v_earned_xp := 100;
                END IF;

                v_correct_count := v_correct_count + 1;
                v_total_xp := v_total_xp + v_earned_xp;
            ELSE
                v_wrong_count := v_wrong_count + 1;
            END IF;

            v_review_list := v_review_list || jsonb_build_object(
                'question_id', v_q_record.id,
                'topic_title', v_q_record.topic_title,
                'difficulty', v_q_record.difficulty,
                'is_correct', v_is_correct,
                'earned_xp', v_earned_xp,
                'user_answer', v_user_ans,
                'correct_answer_display', CASE 
                    WHEN v_q_record.type = 'choice' THEN (v_q_record.options ->> v_q_record.correct_answer)
                    ELSE concat(v_q_record.correct_numeric, ' ', coalesce(v_q_record.unit, ''))
                END,
                'formula_reference', v_q_record.formula_reference,
                'explanation', v_q_record.explanation
            );
        END IF;
    END LOOP;

    IF v_valid_count = 0 THEN
        RAISE EXCEPTION 'Evaluasi gagal: Tidak ada butir soal valid yang dapat diproses.';
    END IF;

    v_accuracy := round((v_correct_count::numeric / v_valid_count::numeric) * 100, 2);
    IF v_accuracy >= 90 THEN v_title := 'Grandmaster Geometri';
    ELSIF v_accuracy >= 75 THEN v_title := 'Master Lingkaran';
    ELSIF v_accuracy >= 60 THEN v_title := 'Ksatria Geometri';
    ELSE v_title := 'Penjelajah Lingkaran';
    END IF;

    v_session_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.game_sessions (
        session_token,
        status,
        user_id,
        player_name,
        school,
        topic_id,
        difficulty,
        total_questions,
        correct_count,
        wrong_count,
        accuracy_percentage,
        score_xp,
        duration_seconds,
        title_awarded,
        session_answers,
        completed_at
    ) VALUES (
        v_session_token,
        'completed',
        v_user_id,
        v_clean_name,
        v_clean_school,
        nullif(p_topic_id, 'all'),
        p_difficulty,
        v_valid_count,
        v_correct_count,
        v_wrong_count,
        v_accuracy,
        v_total_xp,
        p_duration_seconds,
        v_title,
        v_review_list,
        now()
    )
    RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'session_token', v_session_token,
        'player_name', v_clean_name,
        'total_questions', v_valid_count,
        'correct_count', v_correct_count,
        'wrong_count', (v_valid_count - v_correct_count),
        'accuracy_percentage', v_accuracy,
        'score_xp', v_total_xp,
        'duration_seconds', p_duration_seconds,
        'title_awarded', v_title,
        'reviews', v_review_list
    );
END;
$$;

-- ============================================================================
-- 15. RPC PEMBAHASAN TEROTORISASI: get_session_review
-- Hanya dapat diakses oleh admin/staf, akun pemilik sesi, atau pemegang token sah
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_session_review(
    p_session_id UUID,
    p_session_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_session RECORD;
BEGIN
    SELECT 
        id,
        user_id,
        session_token,
        player_name,
        score_xp,
        accuracy_percentage,
        session_answers,
        status
    INTO v_session
    FROM public.game_sessions
    WHERE id = p_session_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesi permainan dengan ID % tidak ditemukan.', p_session_id;
    END IF;

    -- Verifikasi Otorisasi:
    -- Boleh jika Staf Pengajar/Admin, ATAU Siswa Pemilik Sesi, ATAU Pemegang Token Sesi Sah
    IF NOT (
        public.is_staff()
        OR (auth.uid() IS NOT NULL AND auth.uid() = v_session.user_id)
        OR (p_session_token IS NOT NULL AND p_session_token = v_session.session_token)
    ) THEN
        RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki wewenang untuk memeriksa ulasan sesi ini.';
    END IF;

    RETURN jsonb_build_object(
        'session_id', v_session.id,
        'player_name', v_session.player_name,
        'status', v_session.status,
        'score_xp', v_session.score_xp,
        'accuracy_percentage', v_session.accuracy_percentage,
        'reviews', v_session.session_answers
    );
END;
$$;

COMMENT ON FUNCTION public.get_session_review(UUID, TEXT) IS 'Mengambil detail pembahasan dan review soal sesi yang telah tersimpan secara resmi.';

-- ============================================================================
-- 16. MANAJEMEN HAK AKSES MINIMUM (Least Privilege Principle)
-- ============================================================================

-- Cabut seluruh izin default dari PUBLIC
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Berikan izin akses skema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Hak Akses Tabel
GRANT SELECT ON public.topics TO anon, authenticated, service_role;
GRANT SELECT ON public.questions TO anon, authenticated, service_role;
GRANT SELECT ON public.mock_leaderboard TO anon, authenticated, service_role;
GRANT SELECT ON public.leaderboard_public TO anon, authenticated, service_role;

GRANT SELECT ON public.game_sessions TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON public.learning_progress TO authenticated, service_role;

GRANT SELECT ON public.admin_users TO authenticated, service_role;
GRANT ALL ON public.admin_users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_solutions TO authenticated, service_role;

-- Hak Akses Eksekusi Fungsi RPC
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

-- bootstrap_first_admin KHUSUS service_role (tidak bisa dipanggil oleh akun biasa)
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(UUID, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT, BOOLEAN) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.start_game_session(TEXT, TEXT, TEXT, TEXT, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_game_session(UUID, TEXT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_game_session(TEXT, TEXT, TEXT, TEXT, INT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_session_review(UUID, TEXT) TO anon, authenticated, service_role;

-- ============================================================================
-- 17. SEED DATA AWAL: 8 TOPIK KURIKULUM LINGKARAN SMA FASE F
-- ============================================================================
INSERT INTO public.topics (id, chapter_number, title, category, formula_summary, description)
VALUES 
    ('unsur_lingkaran', 1, 'Unsur-unsur Lingkaran', 'Konsep Dasar', 'd = 2r | a = √(r² - (t/2)²)', 'Mengenal titik pusat, jari-jari, diameter, busur, tali busur, tembereng, juring, dan apotema.'),
    ('keliling_busur', 2, 'Keliling & Panjang Busur', 'Sudut & Luas', 'K = 2πr | s = (α/360°) × 2πr', 'Perhitungan keliling lingkaran penuh serta proporsi panjang busur berdasarkan sudut pusat.'),
    ('luas_juring_tembereng', 3, 'Luas Juring & Tembereng', 'Sudut & Luas', 'L_juring = (α/360°) × πr² | L_tembereng = L_juring - L_Δ', 'Kalkulasi luas sektor juring dan tembereng yang dibatasi tali busur.'),
    ('sudut_pusat_keliling', 4, 'Sudut Pusat & Keliling', 'Sudut & Luas', '∠Pusat = 2 × ∠Keliling | Teorema Thales: ∠ = 90°', 'Hubungan sudut pusat dan sudut keliling yang menghadap busur yang sama.'),
    ('garis_singgung', 5, 'Garis Singgung Lingkaran', 'Garis Singgung', 'd = √(p² - r²) | Jari-jari ⊥ Garis Singgung', 'Sifat garis singgung tegak lurus jari-jari dan penerapan teorema Pythagoras.'),
    ('gspl', 6, 'Garis Singgung Persekutuan Luar', 'Garis Singgung', 'd = √(p² - (R - r)²)', 'Panjang garis singgung luar antara dua lingkaran terpisah.'),
    ('gspd', 7, 'Garis Singgung Persekutuan Dalam', 'Garis Singgung', 'd = √(p² - (R + r)²)', 'Panjang garis singgung menyilang di antara dua lingkaran.'),
    ('aplikasi_campuran', 8, 'Aplikasi & Latihan Campuran', 'Tantangan Master', 'Panjang Rantai = 2d + Busur R + Busur r', 'Penerapan konsep lingkaran pada sistem sabuk katrol, roda gigi sepeda, dan masalah nyata.')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    formula_summary = EXCLUDED.formula_summary,
    description = EXCLUDED.description;

-- ============================================================================
-- 18. SEED DATA AWAL: 20 SOAL & KUNCI JAWABAN TERISOLASI
-- ============================================================================

-- Topik 1: Unsur-unsur Lingkaran
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('unsur-01', 'unsur_lingkaran', 'Unsur-unsur Lingkaran', 'mudah', 'Dasar', 'choice', 
 'Daerah di dalam lingkaran yang dibatasi oleh sebuah busur lingkaran dan dua jari-jari yang menghubungkan ujung busur ke pusat lingkaran disebut ...',
 '["Tembereng", "Juring (Sektor)", "Apotema", "Tali Busur"]'::jsonb, '', 'Bayangkan sepotong potongan pizza yang berpusat pada titik tengah lingkaran.'),
('unsur-02', 'unsur_lingkaran', 'Unsur-unsur Lingkaran', 'sedang', 'Menengah', 'choice',
 'Garis terpendek yang ditarik dari titik pusat lingkaran tegak lurus ke suatu tali busur dinamakan ...',
 '["Diameter", "Busur minor", "Apotema", "Garis pelukis"]'::jsonb, '', 'Garis ini membagi tali busur menjadi dua bagian yang sama panjang dan selalu tegak lurus (90°).'),
('unsur-03', 'unsur_lingkaran', 'Unsur-unsur Lingkaran', 'mudah', 'Dasar', 'choice',
 'Sebuah lingkaran memiliki diameter 28 cm. Berapakah panjang jari-jari lingkaran tersebut?',
 '["7 cm", "14 cm", "28 cm", "56 cm"]'::jsonb, '', 'Jari-jari bernilai tepat separuh dari panjang diameter.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('unsur-01', 1, NULL, NULL, 'Definisi Geometri Dasar', 'Juring (sektor) adalah daerah yang dibatasi oleh dua jari-jari dan satu busur lingkaran. Sedangkan tembereng dibatasi oleh tali busur dan busurnya.'),
('unsur-02', 2, NULL, NULL, 'Apotema ⊥ Tali Busur', 'Apotema adalah ruas garis yang menghubungkan titik pusat lingkaran secara tegak lurus dengan sebuah tali busur.'),
('unsur-03', 1, NULL, NULL, 'r = 1/2 · d', 'r = d / 2 = 28 / 2 = 14 cm.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 2: Keliling & Panjang Busur
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('busur-01', 'keliling_busur', 'Keliling & Panjang Busur', 'mudah', 'Dasar', 'choice',
 'Sebuah lingkaran memiliki jari-jari r = 14 cm. Dengan menggunakan π = 22/7, berapakah keliling lingkaran tersebut?',
 '["44 cm", "88 cm", "176 cm", "616 cm"]'::jsonb, '', 'Gunakan perkalian 2 × (22/7) × 14.'),
('busur-02', 'keliling_busur', 'Keliling & Panjang Busur', 'sedang', 'Menengah', 'choice',
 'Diketahui sudut pusat lingkaran ∠AOB = 90° dan jari-jari r = 28 cm (π = 22/7). Berapakah panjang busur AB?',
 '["22 cm", "44 cm", "88 cm", "176 cm"]'::jsonb, '', '90° merupakan seperempat (1/4) dari keliling penuh lingkaran.'),
('busur-num-01', 'keliling_busur', 'Keliling & Panjang Busur', 'mudah', 'Dasar', 'numeric',
 'Sebuah lingkaran berjari-jari r = 7 cm (gunakan π = 22/7). Berapakah keliling lingkaran tersebut?',
 '[]'::jsonb, 'cm', 'K = 2 × (22/7) × 7.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('busur-01', 1, NULL, NULL, 'K = 2 · π · r', 'K = 2 × π × r = 2 × (22/7) × 14 = 88 cm.'),
('busur-02', 1, NULL, NULL, 's = (α / 360°) × 2πr', 'Keliling lingkaran K = 176 cm. Panjang busur AB = (90°/360°) × 176 = 1/4 × 176 = 44 cm.'),
('busur-num-01', NULL, 44.0, 0.20, 'K = 2 · π · r', 'K = 2 × (22/7) × 7 = 2 × 22 = 44 cm.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 3: Luas Juring & Tembereng
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('juring-01', 'luas_juring_tembereng', 'Luas Juring & Tembereng', 'sedang', 'Menengah', 'choice',
 'Suatu juring memiliki sudut pusat 60° pada lingkaran berjari-jari 21 cm (π = 22/7). Luas juring tersebut adalah ...',
 '["231 cm²", "462 cm²", "693 cm²", "1.386 cm²"]'::jsonb, '', '60° / 360° = 1/6 dari luas keseluruhan lingkaran.'),
('juring-02', 'luas_juring_tembereng', 'Luas Juring & Tembereng', 'sulit', 'Lanjutan', 'choice',
 'Pada lingkaran berpusat O dengan jari-jari 10 cm, terdapat sudut siku-siku ∠AOB = 90°. Luas tembereng AB adalah ... (Gunakan π = 3,14)',
 '["28,5 cm²", "50 cm²", "78,5 cm²", "114 cm²"]'::jsonb, '', 'L_juring = 1/4 × πr², dan L_segitiga = 1/2 × r × r.'),
('juring-num-01', 'luas_juring_tembereng', 'Luas Juring & Tembereng', 'sedang', 'Menengah', 'numeric',
 'Diketahui sudut pusat juring α = 90° pada lingkaran dengan jari-jari r = 14 cm (π = 22/7). Berapakah luas juring tersebut?',
 '[]'::jsonb, 'cm²', '90°/360° = 1/4 bagian lingkaran penuh. Luas lingkaran = (22/7) × 14 × 14 = 616.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('juring-01', 0, NULL, NULL, 'L_juring = (α / 360°) × πr²', 'Luas lingkaran penuh = (22/7) × 21 × 21 = 1.386 cm². Luas juring = 1/6 × 1.386 = 231 cm².'),
('juring-02', 0, NULL, NULL, 'L_tembereng = L_juring - L_segitiga', 'L_juring = 0,25 × 314 = 78,5 cm². L_segitiga = 1/2 × 10 × 10 = 50 cm². Luas tembereng = 78,5 - 50 = 28,5 cm².'),
('juring-num-01', NULL, 154.0, 0.50, 'L_juring = (α / 360°) · π · r²', 'L_juring = 1/4 × (22/7) × 14 × 14 = 1/4 × 616 = 154 cm².')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 4: Sudut Pusat & Keliling
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('sudut-01', 'sudut_pusat_keliling', 'Sudut Pusat & Sudut Keliling', 'mudah', 'Dasar', 'choice',
 'Jika sudut keliling ∠ACB yang menghadap busur AB bernilai 35°, berapakah besar sudut pusat ∠AOB yang menghadap busur yang sama?',
 '["17,5°", "35°", "70°", "140°"]'::jsonb, '', 'Sudut pusat selalu 2 kali lipat dari sudut keliling yang menghadap busur yang sama.'),
('sudut-02', 'sudut_pusat_keliling', 'Sudut Pusat & Sudut Keliling', 'sedang', 'Menengah', 'choice',
 'Sebuah sudut keliling menghadap ke tali busur yang merupakan diameter lingkaran. Berapakah besar sudut keliling tersebut?',
 '["45°", "60°", "90° (Siku-siku)", "180°"]'::jsonb, '', 'Sudut pusat yang dibentuk oleh diameter adalah garis lurus (180°).'),
('sudut-num-01', 'sudut_pusat_keliling', 'Sudut Pusat & Sudut Keliling', 'mudah', 'Dasar', 'numeric',
 'Sudut pusat ∠AOB bernilai 130°. Berapakah besar sudut keliling ∠ACB yang menghadap busur yang sama?',
 '[]'::jsonb, '°', 'Sudut keliling selalu setengah dari sudut pusat jika menghadap busur yang sama.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('sudut-01', 2, NULL, NULL, 'Sudut Pusat = 2 × Sudut Keliling', 'Besar sudut pusat = 2 × sudut keliling = 2 × 35° = 70°.'),
('sudut-02', 2, NULL, NULL, 'Teorema Thales: ∠ = 1/2 × 180°', 'Karena diameter membentuk sudut lurus 180°, sudut keliling yang menghadapnya adalah 1/2 × 180° = 90° (siku-siku).'),
('sudut-num-01', NULL, 65.0, 0.10, 'Sudut Keliling = 1/2 · Sudut Pusat', 'Besar sudut keliling = 130° / 2 = 65°.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 5: Garis Singgung Lingkaran
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('gs-01', 'garis_singgung', 'Garis Singgung Lingkaran', 'sedang', 'Menengah', 'choice',
 'Sebuah titik P berada di luar lingkaran yang berpusat di O dengan jari-jari r = 5 cm. Jarak titik P ke pusat O adalah 13 cm. Panjang ruas garis singgung dari P ke lingkaran adalah ...',
 '["8 cm", "12 cm", "14 cm", "18 cm"]'::jsonb, '', 'Jari-jari di titik singgung membentuk segitiga siku-siku dengan hipotenusa OP.'),
('gs-num-01', 'garis_singgung', 'Garis Singgung Lingkaran', 'sedang', 'Menengah', 'numeric',
 'Sebuah titik luar P berjarak 25 cm dari pusat lingkaran O. Jika jari-jari lingkaran r = 7 cm, berapakah panjang ruas garis singgung dari P ke lingkaran?',
 '[]'::jsonb, 'cm', 'Gunakan teorema Pythagoras: d = √(25² - 7²) = √(625 - 49).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('gs-01', 1, NULL, NULL, 'Teorema Pythagoras: d = √(OP² - r²)', 'Garis singgung tegak lurus jari-jari. d = √(13² - 5²) = √(169 - 25) = √144 = 12 cm.'),
('gs-num-01', NULL, 24.0, 0.20, 'd = √(OP² - r²)', 'd = √(25² - 7²) = √(625 - 49) = √576 = 24 cm.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 6: Garis Singgung Persekutuan Luar (GSPL)
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('gspl-01', 'gspl', 'Garis Singgung Persekutuan Luar', 'sedang', 'Menengah', 'choice',
 'Dua lingkaran memiliki jari-jari R = 11 cm dan r = 3 cm. Jarak antara kedua titik pusat adalah 17 cm. Panjang garis singgung persekutuan luar (GSPL) adalah ...',
 '["12 cm", "15 cm", "16 cm", "20 cm"]'::jsonb, '', 'Hitung selisih jari-jari: R - r = 11 - 3 = 8 cm. Lalu gunakan Pythagoras dengan jarak pusat 17 cm.'),
('gspl-num-01', 'gspl', 'Garis Singgung Persekutuan Luar', 'sedang', 'Menengah', 'numeric',
 'Dua lingkaran memiliki jari-jari R = 15 cm dan r = 7 cm dengan jarak kedua pusat p = 17 cm. Hitung panjang garis singgung persekutuan luar (GSPL).',
 '[]'::jsonb, 'cm', 'Selisih jari-jari: R - r = 15 - 7 = 8 cm. Lalu d = √(17² - 8²).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('gspl-01', 1, NULL, NULL, 'd = √(p² - (R - r)²)', 'd = √(17² - (11 - 3)²) = √(289 - 64) = √225 = 15 cm.'),
('gspl-num-01', NULL, 15.0, 0.20, 'd = √(p² - (R - r)²)', 'd = √(17² - 8²) = √(289 - 64) = √225 = 15 cm.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 7: Garis Singgung Persekutuan Dalam (GSPD)
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('gspd-01', 'gspd', 'Garis Singgung Persekutuan Dalam', 'sulit', 'Lanjutan', 'choice',
 'Dua lingkaran memiliki jari-jari R = 7 cm dan r = 3 cm. Jarak antara kedua pusat lingkaran adalah 26 cm. Panjang garis singgung persekutuan dalam (GSPD) adalah ...',
 '["20 cm", "22 cm", "24 cm", "25 cm"]'::jsonb, '', 'Pada GSPD, jari-jari dijumlahkan: R + r = 7 + 3 = 10 cm.'),
('gspd-num-01', 'gspd', 'Garis Singgung Persekutuan Dalam', 'sulit', 'Lanjutan', 'numeric',
 'Dua lingkaran terpisah dengan jari-jari R = 9 cm dan r = 3 cm. Jarak antarpusat lingkaran p = 20 cm. Berapakah panjang garis singgung persekutuan dalam (GSPD)?',
 '[]'::jsonb, 'cm', 'Jumlah jari-jari: R + r = 9 + 3 = 12 cm. Lalu d = √(20² - 12²).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('gspd-01', 2, NULL, NULL, 'd = √(p² - (R + r)²)', 'd = √(26² - (7 + 3)²) = √(676 - 100) = √576 = 24 cm.'),
('gspd-num-01', NULL, 16.0, 0.20, 'd = √(p² - (R + r)²)', 'd = √(20² - 12²) = √(400 - 144) = √256 = 16 cm.')
ON CONFLICT (question_id) DO NOTHING;

-- Topik 8: Aplikasi Rantai & Campuran
INSERT INTO public.questions (id, topic_id, topic_title, difficulty, difficulty_label, type, question, options, unit, hint)
VALUES 
('app-01', 'aplikasi_campuran', 'Aplikasi & Latihan Campuran', 'sulit', 'Tantangan Master', 'choice',
 'Dua buah roda gigi sepeda masing-masing berjari-jari 14 cm dan 4 cm dihubungkan dengan rantai terbuka melingkar (GSPL). Jika jarak pusat kedua poros roda gigi adalah 26 cm, panjang rentang rantai bebas yang lurus antara kedua roda adalah ...',
 '["20 cm", "24 cm", "25 cm", "28 cm"]'::jsonb, '', 'Bagian rantai yang lurus membentang persis sama dengan panjang garis singgung persekutuan luar (GSPL).'),
('app-02', 'aplikasi_campuran', 'Aplikasi & Latihan Campuran', 'sedang', 'Menengah', 'choice',
 'Sebuah roda sepeda berdiameter 56 cm berputar sebanyak 50 kali putaran di lintasan lurus (π = 22/7). Berapakah jarak total yang ditempuh roda?',
 '["44 meter", "88 meter", "176 meter", "352 meter"]'::jsonb, '', 'Keliling roda = (22/7) × 56 cm = 176 cm. Kalikan dengan 50 lalu konversi ke meter.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_solutions (question_id, correct_answer, correct_numeric, tolerance, formula_reference, explanation)
VALUES 
('app-01', 1, NULL, NULL, 'Aplikasi GSPL: d = √(p² - (R - r)²)', 'Rentang rantai bebas sama dengan panjang GSPL: d = √(26² - (14 - 4)²) = √(676 - 100) = √576 = 24 cm.'),
('app-02', 1, NULL, NULL, 'Jarak = Jumlah Putaran × Keliling (K = π · d)', 'K = (22/7) × 56 = 176 cm. Jarak = 50 × 176 cm = 8.800 cm = 88 meter.')
ON CONFLICT (question_id) DO NOTHING;

-- ============================================================================
-- 19. SEED DATA AWAL: PAPAN PERINGKAT SIMULASI DEMO (DETERMINISTIK TANPA DUPLIKASI)
-- Menggunakan UUID deterministik dan batasan unik (player_name, school)
-- ============================================================================
INSERT INTO public.mock_leaderboard (id, player_name, school, title, xp, accuracy, duration_seconds)
VALUES 
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'Aisyah Rahmadani', 'SMA Bintang Prestasi', 'Grandmaster Geometri', 4120, 100.0, 134),
    ('a0000000-0000-0000-0000-000000000002'::uuid, 'Fajar Kusuma', 'SMAN 1 Kota Pelajar', 'Master GSPL', 3450, 90.0, 165),
    ('a0000000-0000-0000-0000-000000000003'::uuid, 'Bima Pratama', 'SMAN 3 Cendekia', 'Pakar Juring', 3180, 80.0, 172),
    ('a0000000-0000-0000-0000-000000000004'::uuid, 'Dian Safitri', 'SMA Nusantara Jaya', 'Eksplorer Busur', 2890, 87.5, 150),
    ('a0000000-0000-0000-0000-000000000005'::uuid, 'Reza Ananda', 'SMAN 5 Budi Mulia', 'Pakar Teorema Thales', 2640, 75.0, 180),
    ('a0000000-0000-0000-0000-000000000006'::uuid, 'Nadia Putri', 'SMA Bina Insan', 'Ahli GSPD', 2410, 75.0, 195)
ON CONFLICT (id) DO UPDATE SET 
    xp = EXCLUDED.xp,
    accuracy = EXCLUDED.accuracy,
    duration_seconds = EXCLUDED.duration_seconds;

-- Selesai
