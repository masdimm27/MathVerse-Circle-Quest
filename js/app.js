/**
 * MathVerse — Circle Quest
 * js/app.js
 * 
 * Pengendali utama antarmuka (Controller):
 * - Pengalih tema Terang/Gelap (Theme Toggle) & persistensi localStorage
 * - Navigasi responsif & scrollspy
 * - Interaktivitas anatomi diagram lingkaran di Hero Section
 * - Filter kategori kartu materi
 * - Modal eksplorasi rincian materi
 * - Pratinjau interaktif widget kuis (Question Engine v0.1)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. TEMA TERANG / GELAP (THEME TOGGLE)
     ========================================================================== */
  const THEME_STORAGE_KEY = 'mathverse_theme_preference';
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const rootElement = document.documentElement;

  /**
   * Menentukan tema awal berdasarkan preferensi tersimpan atau preferensi sistem
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  };

  /**
   * Menerapkan tema ke elemen root
   * @param {'dark'|'light'} theme 
   */
  const applyTheme = (theme) => {
    rootElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`);
    }
  };

  /**
   * Mengganti tema saat tombol diklik
   */
  const toggleTheme = () => {
    const currentTheme = rootElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Mendengarkan perubahan preferensi warna sistem operasi
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  initTheme();

  /* ==========================================================================
     2. NAVIGASI MOBILE & SCROLLSPY
     ========================================================================== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinksList = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuToggle && navLinksList) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinksList.classList.toggle('active');
    });

    // Menutup menu mobile saat link diklik
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinksList.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scrollspy: Aktifkan link navbar sesuai posisi scroll
  const sections = document.querySelectorAll('section[id]');
  const handleScrollSpy = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (matchingLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach((l) => l.classList.remove('active'));
          matchingLink.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', handleScrollSpy, { passive: true });

  /* ==========================================================================
     3. INTERAKTIVITAS DIAGRAM HERO SECTION
     ========================================================================== */
  const heroInspectionBox = document.getElementById('hero-inspection-box');
  const geomInteractiveParts = document.querySelectorAll('.geom-interactive-part');
  const legendChips = document.querySelectorAll('.legend-chip');

  const defaultInspectionText = 'Arahkan kursor atau sentuh elemen geometri di atas untuk melihat penjelasannya.';

  /**
   * Memperbarui teks inspeksi di bawah diagram
   * @param {string} name - Nama elemen
   * @param {string} desc - Keterangan definisi
   */
  const updateInspection = (name, desc) => {
    if (!heroInspectionBox) return;
    if (!name) {
      heroInspectionBox.innerHTML = `<span>${defaultInspectionText}</span>`;
      return;
    }
    heroInspectionBox.innerHTML = `<div><strong>${name}:</strong> <span>${desc}</span></div>`;
  };

  geomInteractiveParts.forEach((part) => {
    const name = part.getAttribute('data-name');
    const desc = part.getAttribute('data-desc');

    part.addEventListener('mouseenter', () => updateInspection(name, desc));
    part.addEventListener('focus', () => updateInspection(name, desc));
    part.addEventListener('mouseleave', () => updateInspection());
    part.addEventListener('blur', () => updateInspection());

    part.addEventListener('click', () => {
      updateInspection(name, desc);
      // Highlight tombol chip terkait
      const elementId = part.getAttribute('id');
      legendChips.forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-target') === elementId);
      });
    });
  });

  // Tombol chip legenda di bawah diagram
  legendChips.forEach((chip) => {
    const targetId = chip.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
      const name = targetEl.getAttribute('data-name');
      const desc = targetEl.getAttribute('data-desc');

      chip.addEventListener('mouseenter', () => {
        targetEl.style.filter = 'drop-shadow(0 0 10px #06B6D4)';
        updateInspection(name, desc);
      });

      chip.addEventListener('mouseleave', () => {
        targetEl.style.filter = '';
        updateInspection();
      });

      chip.addEventListener('click', () => {
        legendChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateInspection(name, desc);
      });
    }
  });

  /* ==========================================================================
     4. FILTER MODUL TOPIK MATERI
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const topicCards = document.querySelectorAll('.topic-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.getAttribute('data-filter');

      // Update status tombol aktif
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter kartu topik
      topicCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedFilter === 'all' || cardCategory === selectedFilter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     5. MODAL DETAIL EKSPLORASI MATERI
     ========================================================================== */
  const topicModal = document.getElementById('topic-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-btn-dismiss');
  const modalTopicTitle = document.getElementById('modal-topic-title');
  const modalTopicCategory = document.getElementById('modal-topic-category');
  const modalDiagramContainer = document.getElementById('modal-diagram-container');
  const modalFormulaBox = document.getElementById('modal-formula-box');
  const modalDescText = document.getElementById('modal-desc-text');

  // Metadata lengkap 8 materi untuk modal
  const topicsDetailData = {
    unsur_lingkaran: {
      title: 'Unsur-unsur Lingkaran',
      category: 'Konsep Dasar',
      formula: 'd = 2r | Keliling K = 2πr | Luas L = πr²',
      description: 'Lingkaran adalah himpunan semua titik pada bidang datar yang berjarak sama terhadap titik tertentu (titik pusat). Unsur-unsur utamanya meliputi: (1) Jari-jari (r): jarak pusat ke tepi, (2) Diameter (d): garis tengah lingkaran bernilai 2r, (3) Busur: kurva lengkung pada lingkaran, (4) Tali Busur: garis lurus penghubung dua titik lingkaran, (5) Tembereng: daerah yang dibatasi tali busur dan busurnya, (6) Juring: daerah potongan antara dua jari-jari dan busur, serta (7) Apotema: garis terpendek dari pusat tegak lurus ke tali busur.'
    },
    keliling_busur: {
      title: 'Keliling & Panjang Busur',
      category: 'Sudut & Luas',
      formula: 'Keliling: K = 2·π·r | Panjang Busur: s = (α / 360°) × 2·π·r',
      description: 'Keliling lingkaran mengukur panjang lintasan satu putaran penuh. Jika kita hanya mengambil sebagian busur dengan sudut pusat α°, panjang busur tersebut berbanding lurus dengan besar sudut pusatnya terhadap sudut satu putaran penuh (360°).'
    },
    luas_juring_tembereng: {
      title: 'Luas Juring & Tembereng',
      category: 'Sudut & Luas',
      formula: 'L_juring = (α / 360°) × π·r² | L_tembereng = L_juring - L_segitiga',
      description: 'Luas juring merupakan bagian dari luas total lingkaran sebanding dengan sudut pusat α°. Sedangkan tembereng merupakan daerah yang tersisa jika luas juring dikurangi dengan luas segitiga yang dibentuk oleh kedua jari-jari dan tali busurnya.'
    },
    sudut_pusat_keliling: {
      title: 'Sudut Pusat & Sudut Keliling',
      category: 'Sudut & Luas',
      formula: 'Sudut Pusat = 2 × Sudut Keliling (Menghadap busur yang sama)',
      description: 'Teorema mendasar geometri lingkaran menyatakan bahwa besar sudut pusat adalah dua kali besar sudut keliling jika keduanya menghadap busur yang sama. Akibat wajar: semua sudut keliling yang menghadap busur yang sama bernilai sama besar, dan sudut keliling yang menghadap diameter selalu 90° (siku-siku).'
    },
    garis_singgung: {
      title: 'Garis Singgung Lingkaran',
      category: 'Garis Singgung',
      formula: 'd = √(p² - r²) | Jari-jari ⊥ Garis Singgung di Titik Singgung',
      description: 'Garis singgung lingkaran adalah garis lurus yang memotong lingkaran tepat di satu titik. Sifat krusial: jari-jari yang ditarik ke titik singgung selalu tegak lurus (membentuk sudut 90°) terhadap garis singgung. Oleh karena itu, panjang garis singgung dari titik di luar lingkaran dapat dihitung dengan Teorema Pythagoras.'
    },
    gspl: {
      title: 'Garis Singgung Persekutuan Luar (GSPL)',
      category: 'Garis Singgung',
      formula: 'd = √(p² - (R - r)²)',
      description: 'GSPL adalah ruas garis singgung yang menghubungkan sisi luar dua lingkaran terpisah tanpa memotong garis hubung kedua pusat. Dengan membuat garis bantu sejajar berjarak r dari pusat lingkaran besar, terbentuk segitiga siku-siku dengan hipotenusa p (jarak pusat) dan sisi tegak selisih jari-jari (R - r).'
    },
    gspd: {
      title: 'Garis Singgung Persekutuan Dalam (GSPD)',
      category: 'Garis Singgung',
      formula: 'd = √(p² - (R + r)²)',
      description: 'GSPD adalah ruas garis singgung yang menyilang di antara dua lingkaran dan memotong garis hubung antar kedua pusat lingkaran. Pada perhitungan GSPD, kedua jari-jari dijumlahkan (R + r) sebagai salah satu sisi tegak segitiga siku-siku Pythagoras.'
    },
    aplikasi_campuran: {
      title: 'Aplikasi & Latihan Campuran',
      category: 'Tantangan Master',
      formula: 'Panjang Rantai Terbuka = 2·d + Busur R + Busur r',
      description: 'Penerapan praktis geometri lingkaran banyak ditemukan pada desain mesin, rantai sepeda, puli katrol, serta mekanika putaran roda gigi. Penguasaan kombinasi garis singgung persekutuan dan panjang busur memungkinkan perhitungan presisi panjang sabuk dan rantai penghubung.'
    }
  };

  /**
   * Membuka modal materi
   * @param {string} topicId 
   */
  const openTopicModal = (topicId) => {
    const data = topicsDetailData[topicId];
    if (!data || !topicModal) return;

    modalTopicTitle.textContent = data.title;
    modalTopicCategory.textContent = data.category;
    modalFormulaBox.textContent = data.formula;
    modalDescText.textContent = data.description;

    // Salin diagram dari kartu yang sesuai
    const sourceCard = document.querySelector(`.topic-card[data-topic-id="${topicId}"]`);
    if (sourceCard && modalDiagramContainer) {
      const sourceSvg = sourceCard.querySelector('.topic-diagram-box svg');
      if (sourceSvg) {
        modalDiagramContainer.innerHTML = '';
        modalDiagramContainer.appendChild(sourceSvg.cloneNode(true));
      }
    }

    // Arahkan tombol 'Pelajari Bab Lengkap' ke nomor bab yang sesuai di materi.html
    const topicBabMap = {
      unsur_lingkaran: 1,
      keliling_busur: 2,
      luas_juring_tembereng: 3,
      sudut_pusat_keliling: 4,
      garis_singgung: 5,
      gspl: 6,
      gspd: 7,
      aplikasi_campuran: 8
    };

    const modalBtnOpenFull = document.getElementById('modal-btn-open-full');
    if (modalBtnOpenFull) {
      const babNum = topicBabMap[topicId] || 1;
      modalBtnOpenFull.href = `materi.html?bab=${babNum}`;
    }

    topicModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Mencegah scroll di background
  };

  /**
   * Menutup modal materi
   */
  const closeTopicModal = () => {
    if (!topicModal) return;
    topicModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Event listener tombol eksplorasi pada kartu
  document.querySelectorAll('[data-action="explore"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const topicId = btn.getAttribute('data-topic');
      openTopicModal(topicId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeTopicModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeTopicModal);

  // Menutup modal saat klik di luar konten (overlay)
  if (topicModal) {
    topicModal.addEventListener('click', (e) => {
      if (e.target === topicModal) closeTopicModal();
    });
  }

  // Menutup modal dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && topicModal && topicModal.classList.contains('active')) {
      closeTopicModal();
    }
  });

  /* ==========================================================================
     6. MESIN GAME MODE TANTANGAN RESMI SUPABASE (CIRCLE QUEST GAME ENGINE)
     ========================================================================== */
  const SESSION_STORAGE_KEY = 'mathverse_circlequest_session';
  const PLAYER_NAME_STORAGE_KEY = 'mathverse_player_name';

  // --- ELEMEN UI ARENA GAME ---
  const screenLobby = document.getElementById('cq-lobby-screen');
  const screenPlay = document.getElementById('cq-play-screen');
  const screenResults = document.getElementById('cq-results-screen');

  // Input & Kontrol Form Lobby
  const inputPlayerName = document.getElementById('cq-player-name');
  const inputPlayerSchool = document.getElementById('cq-player-school');
  const nameErrorMsg = document.getElementById('cq-name-error');
  const selectTopic = document.getElementById('cq-select-topic');
  const selectDifficulty = document.getElementById('cq-select-difficulty');
  const selectCount = document.getElementById('cq-select-count');
  const btnStartGame = document.getElementById('cq-btn-start');

  // HUD Gameplay
  const hudPlayer = document.getElementById('cq-hud-player');
  const hudScore = document.getElementById('cq-hud-score');
  const hudTimer = document.getElementById('cq-hud-timer');
  const hudProgressFill = document.getElementById('cq-progress-fill');
  const curNumEl = document.getElementById('cq-cur-num');
  const totNumEl = document.getElementById('cq-tot-num');
  const hudTopicEl = document.getElementById('cq-hud-topic');
  const hudDiffEl = document.getElementById('cq-hud-diff');
  const hudQxpEl = document.getElementById('cq-hud-q-xp');
  const textQuestionEl = document.getElementById('cq-text-question');

  // Jawaban & Feedback
  const optionsContainer = document.getElementById('cq-options-container');
  const numericContainer = document.getElementById('cq-numeric-container');
  const numericInput = document.getElementById('cq-numeric-input');
  const numericUnit = document.getElementById('cq-numeric-unit');
  const btnSubmitNumeric = document.getElementById('cq-btn-submit-numeric');
  const feedbackBox = document.getElementById('cq-feedback-box');
  const actionRow = document.getElementById('cq-action-row');
  const btnNextQuestion = document.getElementById('cq-btn-next-question');
  const nextBtnText = document.getElementById('cq-next-btn-text');

  // Layar Hasil & Sinkronisasi
  const resPlayer = document.getElementById('cq-res-player');
  const resTitle = document.getElementById('cq-res-title');
  const resScore = document.getElementById('cq-res-score');
  const statCorrect = document.getElementById('cq-stat-correct');
  const statWrong = document.getElementById('cq-stat-wrong');
  const statAccuracy = document.getElementById('cq-stat-accuracy');
  const statTime = document.getElementById('cq-stat-time');
  const reviewList = document.getElementById('cq-review-list');
  const btnPlayAgain = document.getElementById('cq-btn-play-again');
  const cqSyncStatusBox = document.getElementById('cq-sync-status-box');

  // Elemen Integrasi Supabase & Leaderboard
  const supabaseModal = document.getElementById('supabase-modal');
  const btnOpenSupabaseConfig = document.getElementById('btn-open-supabase-config');
  const btnCloseSupabaseModal = document.getElementById('modal-supabase-close');
  const btnCancelSupabaseModal = document.getElementById('btn-supabase-modal-cancel');
  const btnSaveSupabaseConfig = document.getElementById('btn-save-supabase-config');
  const cfgSupabaseUrl = document.getElementById('cfg-supabase-url');
  const cfgSupabaseKey = document.getElementById('cfg-supabase-key');
  const cfgSupabaseStatus = document.getElementById('cfg-supabase-status');
  const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
  const supabaseConnIndicator = document.getElementById('supabase-conn-indicator');
  const supabaseConnLabel = document.getElementById('supabase-conn-label');

  // Pintasan Mode di Sidebar
  const modeJourney = document.getElementById('mode-item-journey');
  const modeSpeed = document.getElementById('mode-item-speed');
  const modeSimulation = document.getElementById('mode-item-simulation');

  // Status internal sesi game aktif
  let activeGame = {
    sessionId: null,
    sessionToken: null,
    playerName: '',
    school: 'Pelajar SMA',
    topicId: 'all',
    difficulty: 'all',
    totalQuestions: 5,
    questions: [],
    userAnswers: {},
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    history: [],
    startTime: null,
    timerInterval: null,
    elapsedSeconds: 0,
    isAnswered: false,
    isSubmitting: false
  };

  // Muat nama pemain tersimpan sebelumnya
  const savedPlayerName = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
  if (savedPlayerName && inputPlayerName) {
    inputPlayerName.value = savedPlayerName;
  }

  // Pengalih layar kuis
  const showScreen = (screenName) => {
    [screenLobby, screenPlay, screenResults].forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (screenName === 'lobby' && screenLobby) screenLobby.classList.add('active');
    if (screenName === 'play' && screenPlay) screenPlay.classList.add('active');
    if (screenName === 'results' && screenResults) screenResults.classList.add('active');
  };

  // Format waktu MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Ambil bobot XP berdasarkan difficulty
  const getQuestionXp = (difficulty) => {
    switch (difficulty) {
      case 'mudah': return 100;
      case 'sedang': return 150;
      case 'sulit': return 200;
      default: return 100;
    }
  };

  // Evaluasi gelar berdasarkan performa
  const evaluateTitle = (accuracy, score) => {
    if (accuracy >= 90) return 'Grandmaster Geometri';
    if (accuracy >= 75) return 'Master Lingkaran';
    if (accuracy >= 60) return 'Ksatria Geometri';
    return 'Penjelajah Lingkaran';
  };

  // Mulai Timer Game
  const startTimer = () => {
    clearInterval(activeGame.timerInterval);
    activeGame.startTime = Date.now() - (activeGame.elapsedSeconds * 1000);
    activeGame.timerInterval = setInterval(() => {
      activeGame.elapsedSeconds = Math.floor((Date.now() - activeGame.startTime) / 1000);
      if (hudTimer) hudTimer.textContent = `⏱️ ${formatTime(activeGame.elapsedSeconds)}`;
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(activeGame.timerInterval);
  };

  // Inisial avatar podium
  const getInitials = (name) => {
    if (!name || name === '-') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Simpan progres lokal untuk pemulihan tak terduga
  const persistSession = () => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        sessionId: activeGame.sessionId,
        sessionToken: activeGame.sessionToken,
        playerName: activeGame.playerName,
        school: activeGame.school,
        currentIndex: activeGame.currentIndex,
        userAnswers: activeGame.userAnswers,
        elapsedSeconds: activeGame.elapsedSeconds
      }));
    } catch (e) {}
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
  };

  // Modal Konfigurasi Supabase
  const openSupabaseModal = () => {
    if (!supabaseModal) return;
    const cfg = MathVerseSupabase.getConfig();
    if (cfgSupabaseUrl) cfgSupabaseUrl.value = cfg.url || '';
    if (cfgSupabaseKey) cfgSupabaseKey.value = cfg.anonKey || '';
    if (cfgSupabaseStatus) {
      cfgSupabaseStatus.style.display = 'none';
      cfgSupabaseStatus.innerHTML = '';
    }
    supabaseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (cfgSupabaseUrl) cfgSupabaseUrl.focus();
  };

  const closeSupabaseModal = () => {
    if (!supabaseModal) return;
    supabaseModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // ==========================================================================
  // RENDER PAPAN PERINGKAT BERSAMA (SUPABASE RPC: get_leaderboard)
  // ==========================================================================
  const renderLeaderboard = async (lastPlayerName = null) => {
    const podiumEl = document.getElementById('leaderboard-podium');
    const tbodyEl = document.getElementById('leaderboard-tbody');

    if (!podiumEl || !tbodyEl) return;

    if (supabaseConnIndicator) supabaseConnIndicator.className = 'status-indicator-dot checking';
    if (supabaseConnLabel) supabaseConnLabel.textContent = 'Menghubungkan ke Papan Peringkat Supabase...';

    // Skeleton loading state
    tbodyEl.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
          <span class="spinner-inline"></span> Mengambil data peringkat resmi dari database Supabase...
        </td>
      </tr>
    `;

    // Cek apakah Supabase sudah dikonfigurasi
    if (!MathVerseSupabase.isConfigured()) {
      if (supabaseConnIndicator) supabaseConnIndicator.className = 'status-indicator-dot offline';
      if (supabaseConnLabel) supabaseConnLabel.textContent = 'Papan Peringkat Bersama (Koneksi Belum Terpasang)';

      podiumEl.innerHTML = `
        <div class="podium-card rank-2" style="opacity: 0.65;">
          <span class="rank-badge">#2</span>
          <div class="podium-avatar">--</div>
          <h4 class="podium-name">-</h4>
          <span class="podium-school">-</span>
          <span class="podium-xp">0 XP</span>
          <span class="badge-pill">Menunggu Supabase</span>
        </div>
        <div class="podium-card rank-1" style="opacity: 0.85;">
          <div class="podium-crown" aria-hidden="true">👑</div>
          <span class="rank-badge" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">#1</span>
          <div class="podium-avatar">--</div>
          <h4 class="podium-name">-</h4>
          <span class="podium-school">-</span>
          <span class="podium-xp">0 XP</span>
          <span class="badge-pill badge-pill-cyan">Peringkat Bersama</span>
        </div>
        <div class="podium-card rank-3" style="opacity: 0.65;">
          <span class="rank-badge">#3</span>
          <div class="podium-avatar">--</div>
          <h4 class="podium-name">-</h4>
          <span class="podium-school">-</span>
          <span class="podium-xp">0 XP</span>
          <span class="badge-pill">Menunggu Supabase</span>
        </div>
      `;

      tbodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 26px;">
            <p style="margin: 0 0 8px; font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
              Papan Peringkat Bersama memerlukan koneksi database Supabase.
            </p>
            <p style="font-size: 0.85rem; margin: 0 0 16px; color: var(--text-secondary);">
              Masukkan URL Proyek dan Public Anon Key agar hasil seluruh pemain tersimpan dan terhubung secara global.
            </p>
            <button type="button" class="btn btn-primary" id="btn-tbody-config" style="font-size: 0.82rem; padding: 8px 18px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Konfigurasi Supabase Sekarang</span>
            </button>
          </td>
        </tr>
      `;

      const tbodyConfigBtn = document.getElementById('btn-tbody-config');
      if (tbodyConfigBtn) tbodyConfigBtn.addEventListener('click', openSupabaseModal);
      return;
    }

    // Ambil data resmi dari Supabase via RPC get_leaderboard(p_limit, p_include_mock: false)
    const result = await MathVerseSupabase.getLeaderboard({ limit: 15, includeMock: false });

    if (!result.success) {
      if (supabaseConnIndicator) supabaseConnIndicator.className = 'status-indicator-dot offline';
      if (supabaseConnLabel) supabaseConnLabel.textContent = 'Papan Peringkat Bersama (Gagal Memuat)';

      tbodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--color-danger); padding: 22px;">
            <p style="margin: 0 0 6px; font-weight: 700;">⚠️ Gagal memuat data dari database Supabase:</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 12px;">${result.error || 'Terjadi kesalahan jaringan'}</p>
            <button type="button" class="btn btn-secondary" id="btn-retry-leaderboard" style="font-size: 0.78rem; padding: 6px 14px;">
              Coba Muat Ulang
            </button>
          </td>
        </tr>
      `;

      const retryBtn = document.getElementById('btn-retry-leaderboard');
      if (retryBtn) retryBtn.addEventListener('click', () => renderLeaderboard(lastPlayerName));
      return;
    }

    // Terhubung secara resmi
    if (supabaseConnIndicator) supabaseConnIndicator.className = 'status-indicator-dot online';
    if (supabaseConnLabel) supabaseConnLabel.textContent = '🟢 Terhubung ke Supabase (Papan Peringkat Bersama)';

    const list = result.data || [];

    if (list.length === 0) {
      podiumEl.innerHTML = `
        <div class="podium-card rank-2" style="opacity: 0.7;">
          <span class="rank-badge">#2</span>
          <div class="podium-avatar">?</div>
          <h4 class="podium-name">Belum Terisi</h4>
          <span class="podium-school">Pemain SMA</span>
          <span class="podium-xp">0 XP</span>
          <span class="badge-pill">Tantangan Terbuka</span>
        </div>
        <div class="podium-card rank-1" style="opacity: 0.9;">
          <div class="podium-crown" aria-hidden="true">👑</div>
          <span class="rank-badge" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">#1</span>
          <div class="podium-avatar">⭐</div>
          <h4 class="podium-name">Juara Pertama</h4>
          <span class="podium-school">Jadilah yang Pertama!</span>
          <span class="podium-xp">-- XP</span>
          <span class="badge-pill badge-pill-cyan">Circle Quest</span>
        </div>
        <div class="podium-card rank-3" style="opacity: 0.7;">
          <span class="rank-badge">#3</span>
          <div class="podium-avatar">?</div>
          <h4 class="podium-name">Belum Terisi</h4>
          <span class="podium-school">Pemain SMA</span>
          <span class="podium-xp">0 XP</span>
          <span class="badge-pill">Tantangan Terbuka</span>
        </div>
      `;

      tbodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 26px;">
            <p style="margin: 0 0 6px; font-weight: 600; color: var(--text-primary);">Belum ada catatan skor resmi di database Supabase.</p>
            <p style="font-size: 0.85rem; margin: 0;">Selesaikan kuis tantangan Circle Quest untuk mencatatkan nama dan gelar Anda sebagai yang pertama di podium!</p>
          </td>
        </tr>
      `;
      return;
    }

    // Render Podium 3 Besar
    const top1 = list[0] || { player_name: '-', school: '-', title: '-', xp: 0 };
    const top2 = list[1] || { player_name: '-', school: '-', title: '-', xp: 0 };
    const top3 = list[2] || { player_name: '-', school: '-', title: '-', xp: 0 };

    podiumEl.innerHTML = `
      <!-- Peringkat 2 -->
      <div class="podium-card rank-2 ${top2.player_name === lastPlayerName ? 'user-highlight-row' : ''}">
        <span class="rank-badge">#2</span>
        <div class="podium-avatar">${getInitials(top2.player_name)}</div>
        <h4 class="podium-name">${top2.player_name}</h4>
        <span class="podium-school">${top2.school || 'Pelajar SMA'}</span>
        <span class="podium-xp">${(top2.xp || 0).toLocaleString('id-ID')} XP</span>
        <span class="badge-pill">${top2.title || 'Peserta'}</span>
      </div>

      <!-- Peringkat 1 -->
      <div class="podium-card rank-1 ${top1.player_name === lastPlayerName ? 'user-highlight-row' : ''}">
        <div class="podium-crown" aria-hidden="true">👑</div>
        <span class="rank-badge" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">#1</span>
        <div class="podium-avatar">${getInitials(top1.player_name)}</div>
        <h4 class="podium-name">${top1.player_name}</h4>
        <span class="podium-school">${top1.school || 'Pelajar SMA'}</span>
        <span class="podium-xp">${(top1.xp || 0).toLocaleString('id-ID')} XP</span>
        <span class="badge-pill badge-pill-cyan">${top1.title || 'Grandmaster'}</span>
      </div>

      <!-- Peringkat 3 -->
      <div class="podium-card rank-3 ${top3.player_name === lastPlayerName ? 'user-highlight-row' : ''}">
        <span class="rank-badge">#3</span>
        <div class="podium-avatar">${getInitials(top3.player_name)}</div>
        <h4 class="podium-name">${top3.player_name}</h4>
        <span class="podium-school">${top3.school || 'Pelajar SMA'}</span>
        <span class="podium-xp">${(top3.xp || 0).toLocaleString('id-ID')} XP</span>
        <span class="badge-pill">${top3.title || 'Peserta'}</span>
      </div>
    `;

    // Render Tabel Peringkat 4 s/d selesai
    const rest = list.slice(3);
    if (rest.length === 0) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 18px;">
            Belum ada catatan peringkat tambahan di bawah 3 besar.
          </td>
        </tr>
      `;
      return;
    }

    tbodyEl.innerHTML = rest.map((item, idx) => {
      const rank = item.rank || (idx + 4);
      const isHighlighted = item.player_name === lastPlayerName;
      return `
        <tr class="${isHighlighted ? 'user-highlight-row' : ''}">
          <td><span class="rank-badge">#${rank}</span></td>
          <td><strong>${item.player_name}</strong> ${isHighlighted ? '<span class="badge-pill badge-pill-cyan" style="font-size: 0.68rem; margin-left: 6px;">Skor Anda</span>' : ''}</td>
          <td>${item.school || 'Pelajar SMA'}</td>
          <td><span class="badge-pill">${item.title || 'Peserta'}</span></td>
          <td style="text-align: right; font-weight: 700; color: var(--color-accent);">${(item.xp || 0).toLocaleString('id-ID')} XP</td>
        </tr>
      `;
    }).join('');
  };

  // ==========================================================================
  // LOGIKA GAMEPLAY & SESI RESMI SERVER
  // ==========================================================================

  // Tampilkan soal yang sedang aktif
  const renderCurrentQuestion = () => {
    if (activeGame.currentIndex >= activeGame.questions.length) {
      finishGame();
      return;
    }

    const q = activeGame.questions[activeGame.currentIndex];
    activeGame.isAnswered = false;

    // Update HUD
    const curNum = activeGame.currentIndex + 1;
    const totalNum = activeGame.questions.length;
    if (curNumEl) curNumEl.textContent = curNum;
    if (totNumEl) totNumEl.textContent = totalNum;
    if (hudProgressFill) {
      const pct = (curNum / totalNum) * 100;
      hudProgressFill.style.width = `${pct}%`;
    }
    if (hudScore) hudScore.textContent = `${activeGame.score} XP`;
    if (hudTopicEl) hudTopicEl.textContent = q.topicTitle || 'Geometri Lingkaran';
    if (hudDiffEl) {
      hudDiffEl.className = `cq-diff-badge cq-diff-${q.difficulty || 'mudah'}`;
      hudDiffEl.textContent = `Tingkat ${q.difficultyLabel || 'Dasar'}`;
    }
    const qXp = getQuestionXp(q.difficulty);
    if (hudQxpEl) hudQxpEl.textContent = `+${qXp} XP`;

    // Reset Box Jawaban & Feedback
    if (textQuestionEl) textQuestionEl.textContent = q.question;
    if (feedbackBox) {
      feedbackBox.classList.remove('active');
      feedbackBox.innerHTML = '';
    }
    if (actionRow) actionRow.style.display = 'none';

    // Tampilkan sesuai tipe soal (Pilihan Ganda vs Isian Numerik)
    const isNumeric = q.type === 'numeric';
    if (isNumeric) {
      if (optionsContainer) optionsContainer.style.display = 'none';
      if (numericContainer) {
        numericContainer.style.display = 'block';
        if (numericInput) {
          numericInput.value = '';
          numericInput.disabled = false;
          numericInput.focus();
        }
        if (numericUnit) numericUnit.textContent = q.unit || '';
        if (btnSubmitNumeric) btnSubmitNumeric.disabled = false;
      }
    } else {
      if (numericContainer) numericContainer.style.display = 'none';
      if (optionsContainer) {
        optionsContainer.style.display = 'flex';
        optionsContainer.innerHTML = '';

        const letters = ['A', 'B', 'C', 'D'];
        (q.options || []).forEach((optText, optIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-option-btn';
          btn.setAttribute('data-index', optIdx);

          btn.innerHTML = `
            <span class="quiz-option-letter">${letters[optIdx]}</span>
            <span class="quiz-option-text">${optText}</span>
          `;

          btn.addEventListener('click', () => handleChoiceAnswer(optIdx, q));
          optionsContainer.appendChild(btn);
        });
      }
    }

    persistSession();
  };

  // Handler jawaban Pilihan Ganda (Sesi Server Resmi)
  const handleChoiceAnswer = (selectedIdx, q) => {
    if (activeGame.isAnswered) return;
    activeGame.isAnswered = true;

    // Simpan jawaban pemain sebagai indeks string ("0", "1", "2", "3") sesuai kontrak schema
    activeGame.userAnswers[q.id] = String(selectedIdx);

    // Tandai tombol yang dipilih
    const optionBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === selectedIdx) {
        btn.classList.add('selected');
      }
    });

    const letters = ['A', 'B', 'C', 'D'];
    const chosenText = (q.options && q.options[selectedIdx]) || '-';

    // Tampilkan Umpan Balik Tersimpan
    if (feedbackBox) {
      feedbackBox.classList.add('active');
      feedbackBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <span style="font-weight: 700; font-size: 0.92rem; color: var(--color-accent-light);">
            ✓ Jawaban Tersimpan: Pilihan ${letters[selectedIdx]} (${chosenText})
          </span>
          <span class="badge-pill badge-pill-cyan" style="font-size: 0.72rem;">
            Sesi Server Resmi
          </span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
          Jawaban Anda telah dicatat pada sesi server. Evaluasi skor, akurasi, dan pembahasan resmi akan dihitung langsung oleh database server di akhir permainan.
        </div>
        ${q.hint ? `
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
            <strong>Petunjuk:</strong> ${q.hint}
          </div>
        ` : ''}
      `;
    }

    // Tampilkan tombol lanjut
    if (actionRow && btnNextQuestion && nextBtnText) {
      actionRow.style.display = 'flex';
      const isLast = (activeGame.currentIndex === activeGame.questions.length - 1);
      nextBtnText.textContent = isLast ? 'Selesaikan & Kirim ke Server 🏆' : 'Soal Berikutnya →';
    }

    persistSession();
  };

  // Handler jawaban Isian Numerik (Sesi Server Resmi)
  const handleNumericAnswer = (q) => {
    if (activeGame.isAnswered) return;

    const rawVal = numericInput.value.trim();
    if (!rawVal) {
      numericInput.focus();
      return;
    }

    const cleanVal = rawVal.replace(',', '.');
    const userNum = parseFloat(cleanVal);
    if (isNaN(userNum)) {
      alert('Silakan masukkan nilai angka yang valid.');
      numericInput.focus();
      return;
    }

    activeGame.isAnswered = true;
    if (numericInput) numericInput.disabled = true;
    if (btnSubmitNumeric) btnSubmitNumeric.disabled = true;

    // Simpan nilai string numerik peserta
    activeGame.userAnswers[q.id] = String(cleanVal);

    const unitStr = q.unit ? ` ${q.unit}` : '';

    if (feedbackBox) {
      feedbackBox.classList.add('active');
      feedbackBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <span style="font-weight: 700; font-size: 0.92rem; color: var(--color-accent-light);">
            ✓ Jawaban Tersimpan: ${rawVal}${unitStr}
          </span>
          <span class="badge-pill badge-pill-cyan" style="font-size: 0.72rem;">
            Sesi Server Resmi
          </span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
          Jawaban Anda telah dicatat pada sesi server. Evaluasi nilai dan akurasi akan dihitung oleh database server di akhir permainan.
        </div>
        ${q.hint ? `
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
            <strong>Petunjuk:</strong> ${q.hint}
          </div>
        ` : ''}
      `;
    }

    // Tampilkan tombol lanjut
    if (actionRow && btnNextQuestion && nextBtnText) {
      actionRow.style.display = 'flex';
      const isLast = (activeGame.currentIndex === activeGame.questions.length - 1);
      nextBtnText.textContent = isLast ? 'Selesaikan & Kirim ke Server 🏆' : 'Soal Berikutnya →';
    }

    persistSession();
  };

  if (btnSubmitNumeric) {
    btnSubmitNumeric.addEventListener('click', () => {
      const q = activeGame.questions[activeGame.currentIndex];
      if (q && q.type === 'numeric') {
        handleNumericAnswer(q);
      }
    });
  }

  if (numericInput) {
    numericInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = activeGame.questions[activeGame.currentIndex];
        if (q && q.type === 'numeric') {
          handleNumericAnswer(q);
        }
      }
    });
  }

  // Tombol lanjut ke soal berikutnya
  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      activeGame.currentIndex++;
      renderCurrentQuestion();
    });
  }

  // ==========================================================================
  // SELESAIKAN GAME & SUBMIT KE SUPABASE (submit_game_session)
  // ==========================================================================
  const finishGame = async () => {
    if (activeGame.isSubmitting) return; // Mencegah pengiriman ganda
    activeGame.isSubmitting = true;

    stopTimer();

    // Loading State pada Tombol Next/Finish
    if (btnNextQuestion) btnNextQuestion.disabled = true;
    if (nextBtnText) {
      nextBtnText.innerHTML = '<span class="spinner-inline"></span> Memvalidasi & Menyimpan Hasil di Server...';
    }

    // Proteksi Human Realism: Server mewajibkan minimal 1 detik per butir soal
    const minRequiredMs = activeGame.totalQuestions * 1000;
    const actualElapsedMs = Date.now() - activeGame.startTime;
    if (actualElapsedMs < minRequiredMs) {
      const waitMs = (minRequiredMs - actualElapsedMs) + 600;
      await new Promise(r => setTimeout(r, waitMs));
    }

    // Susun payload jawaban untuk seluruh soal resmi
    const answersPayload = activeGame.questions.map(q => ({
      question_id: q.id,
      user_answer: (activeGame.userAnswers[q.id] !== undefined && activeGame.userAnswers[q.id] !== null) 
        ? String(activeGame.userAnswers[q.id]) 
        : ''
    }));

    // Panggil RPC submit_game_session(UUID, TEXT, JSONB)
    const submitRes = await MathVerseSupabase.submitGameSession({
      sessionId: activeGame.sessionId,
      sessionToken: activeGame.sessionToken,
      answers: answersPayload
    });

    if (!submitRes || !submitRes.success) {
      activeGame.isSubmitting = false;
      if (btnNextQuestion) btnNextQuestion.disabled = false;
      if (nextBtnText) nextBtnText.textContent = 'Coba Kirim Ulang 🔄';

      const errorMsg = (submitRes && (submitRes.message || submitRes.error)) || 'Terjadi gangguan jaringan saat menyimpan ke server.';

      if (feedbackBox) {
        feedbackBox.classList.add('active');
        feedbackBox.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--color-danger); border-radius: var(--radius-sm); padding: 12px; margin-top: 10px;">
            <div style="font-weight: 800; color: var(--color-danger); margin-bottom: 4px;">
              ⚠️ Gagal Menyimpan Hasil ke Supabase:
            </div>
            <div style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 6px;">
              ${errorMsg}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Sesi dan jawaban Anda tetap tersimpan. Silakan periksa koneksi internet Anda lalu klik tombol <strong>"Coba Kirim Ulang"</strong> di bawah.
            </div>
          </div>
        `;
      }
      return;
    }

    // Sukses: Bersihkan cache sesi lokal
    clearSession();

    // Ambil data hasil yang telah diverifikasi oleh server
    const verifiedTotal = submitRes.total_questions || activeGame.totalQuestions;
    const verifiedCorrect = submitRes.correct_count || 0;
    const verifiedWrong = submitRes.wrong_count || 0;
    const verifiedAccuracy = submitRes.accuracy_percentage || 0;
    const verifiedScore = submitRes.score_xp || 0;
    const verifiedDuration = submitRes.duration_seconds || activeGame.elapsedSeconds;
    const verifiedTitle = submitRes.title_awarded || evaluateTitle(verifiedAccuracy, verifiedScore);

    if (resPlayer) resPlayer.textContent = submitRes.player_name || activeGame.playerName;
    if (resTitle) resTitle.textContent = verifiedTitle;
    if (resScore) resScore.textContent = `${verifiedScore} XP`;

    if (statCorrect) statCorrect.textContent = `${verifiedCorrect}/${verifiedTotal}`;
    if (statWrong) statWrong.textContent = String(verifiedWrong);
    if (statAccuracy) statAccuracy.textContent = `${verifiedAccuracy}%`;
    if (statTime) statTime.textContent = formatTime(verifiedDuration);

    // Render Review List Berdasarkan Hasil Evaluasi Resmi Server
    if (reviewList) {
      const serverReviews = Array.isArray(submitRes.reviews) ? submitRes.reviews : [];
      if (serverReviews.length > 0) {
        reviewList.innerHTML = serverReviews.map((rev, i) => `
          <div class="cq-review-item ${rev.is_correct ? 'is-correct' : 'is-wrong'}" style="margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid ${rev.is_correct ? 'var(--color-success)' : 'var(--color-danger)'}; background: ${rev.is_correct ? 'var(--color-success-bg)' : 'rgba(239, 68, 68, 0.08)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
              <span style="font-weight: 800; color: ${rev.is_correct ? 'var(--color-success)' : 'var(--color-danger)'};">
                ${rev.is_correct ? '✓ Benar' : (rev.is_skipped ? '⊘ Dilewati' : '✗ Belum Tepat')} (+${rev.earned_xp || 0} XP)
              </span>
              <span style="font-size: 0.78rem; color: var(--text-muted);">
                #${i + 1} (${rev.topic_title || 'Geometri'}) • Tingkat ${rev.difficulty || 'Dasar'}
              </span>
            </div>
            <div style="font-size: 0.85rem; margin-bottom: 4px;">
              <strong>Jawaban Anda:</strong> <span style="font-family: var(--font-mono);">${rev.user_answer !== null && rev.user_answer !== '' ? rev.user_answer : '(Tidak dijawab)'}</span>
              ${!rev.is_correct ? ` | <strong>Kunci Resmi:</strong> <span style="color: var(--color-success); font-weight: 700;">${rev.correct_answer_display || '-'}</span>` : ''}
            </div>
            ${rev.formula_reference ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;"><strong>Rumus:</strong> <code style="font-family: var(--font-mono); color: var(--color-accent-light);">${rev.formula_reference}</code></div>` : ''}
            ${rev.explanation ? `<div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;"><strong>Pembahasan:</strong> ${rev.explanation}</div>` : ''}
          </div>
        `).join('');
      } else {
        reviewList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.82rem;">Ringkasan ulasan tidak tersedia.</div>`;
      }
    }

    // Perbarui Banner Status Hasil
    if (cqSyncStatusBox) {
      cqSyncStatusBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--color-success); font-weight: 600;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>✓ Hasil resmi diverifikasi server! Skor <strong>${verifiedScore} XP</strong> berhasil tersimpan di database Supabase dan masuk ke Papan Peringkat Bersama.</span>
        </div>
      `;
    }

    // Tampilkan Layar Hasil
    showScreen('results');

    // Muat ulang Papan Peringkat Bersama dari Supabase secara langsung
    renderLeaderboard(submitRes.player_name || activeGame.playerName);
  };

  // Tombol Main Lagi
  if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', () => {
      showScreen('lobby');
      if (inputPlayerName) inputPlayerName.focus();
    });
  }

  // ==========================================================================
  // MEMULAI GAME DARI FORM (start_game_session)
  // ==========================================================================
  const initGameFromForm = async () => {
    const rawName = inputPlayerName ? inputPlayerName.value.trim() : '';
    const rawSchool = inputPlayerSchool ? inputPlayerSchool.value.trim() : 'Pelajar SMA';

    if (!rawName) {
      if (nameErrorMsg) {
        nameErrorMsg.textContent = 'Harap masukkan nama pemain terlebih dahulu sebelum memulai quest.';
        nameErrorMsg.classList.add('active');
      }
      if (inputPlayerName) {
        inputPlayerName.focus();
        inputPlayerName.classList.add('error');
      }
      return;
    }

    if (rawName.length < 2 || rawName.length > 30) {
      if (nameErrorMsg) {
        nameErrorMsg.textContent = 'Nama pemain harus antara 2 hingga 30 karakter.';
        nameErrorMsg.classList.add('active');
      }
      if (inputPlayerName) inputPlayerName.focus();
      return;
    }

    if (nameErrorMsg) nameErrorMsg.classList.remove('active');
    if (inputPlayerName) inputPlayerName.classList.remove('error');

    // Cek ketersediaan konfigurasi Supabase
    if (!MathVerseSupabase.isConfigured()) {
      openSupabaseModal();
      if (cfgSupabaseStatus) {
        cfgSupabaseStatus.style.display = 'block';
        cfgSupabaseStatus.style.background = 'rgba(245, 158, 11, 0.15)';
        cfgSupabaseStatus.style.color = '#F59E0B';
        cfgSupabaseStatus.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        cfgSupabaseStatus.textContent = 'Untuk mencatat skor resmi dan tampil di leaderboard bersama, silakan isi Project URL & Public Anon Key Supabase terlebih dahulu.';
      }
      return;
    }

    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, rawName);

    const topic = selectTopic ? selectTopic.value : 'all';
    const diff = selectDifficulty ? selectDifficulty.value : 'all';
    const count = selectCount ? parseInt(selectCount.value, 10) : 5;

    // Loading State pada Tombol Mulai
    if (btnStartGame) {
      btnStartGame.disabled = true;
      btnStartGame.innerHTML = `
        <span class="spinner-inline"></span>
        <span>Menyiapkan Sesi Resmi Server...</span>
      `;
    }

    // Panggil RPC start_game_session di server Supabase
    const sessionRes = await MathVerseSupabase.startGameSession({
      playerName: rawName,
      school: rawSchool || 'Pelajar SMA',
      topicId: topic,
      difficulty: diff,
      questionCount: count
    });

    if (btnStartGame) {
      btnStartGame.disabled = false;
      btnStartGame.innerHTML = `
        <span>Mulai Tantangan Circle Quest</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      `;
    }

    if (!sessionRes || !sessionRes.success) {
      const errMsg = (sessionRes && sessionRes.error) || 'Gagal memulai sesi di server Supabase.';
      if (nameErrorMsg) {
        nameErrorMsg.textContent = errMsg;
        nameErrorMsg.classList.add('active');
      }
      alert(`Gagal Memulai Sesi Server: ${errMsg}`);
      return;
    }

    // Susun Soal Resmi Server
    const serverQuestions = (sessionRes.questions || []).map(q => ({
      id: q.id,
      topicId: q.topic_id || q.topicId,
      topicTitle: q.topic_title || q.topicTitle,
      difficulty: q.difficulty,
      difficultyLabel: q.difficulty_label || q.difficultyLabel,
      type: q.type,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      unit: q.unit || '',
      hint: q.hint || ''
    }));

    if (serverQuestions.length === 0) {
      alert('Server tidak mengembalikan butir soal aktif untuk filter yang dipilih.');
      return;
    }

    // Siapkan State Aktif Sesi Resmi
    activeGame = {
      sessionId: sessionRes.session_id,
      sessionToken: sessionRes.session_token,
      playerName: rawName,
      school: rawSchool || 'Pelajar SMA',
      topicId: topic,
      difficulty: diff,
      totalQuestions: sessionRes.total_questions || serverQuestions.length,
      questions: serverQuestions,
      userAnswers: {},
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      history: [],
      startTime: Date.now(),
      timerInterval: null,
      elapsedSeconds: 0,
      isAnswered: false,
      isSubmitting: false
    };

    if (hudPlayer) hudPlayer.textContent = rawName;
    if (hudScore) hudScore.textContent = '0 XP';
    if (hudTimer) hudTimer.textContent = '⏱️ 00:00';

    showScreen('play');
    startTimer();
    renderCurrentQuestion();
  };

  if (btnStartGame) {
    btnStartGame.addEventListener('click', initGameFromForm);
  }

  if (inputPlayerName) {
    inputPlayerName.addEventListener('input', () => {
      if (inputPlayerName.value.trim().length > 0 && nameErrorMsg) {
        nameErrorMsg.classList.remove('active');
      }
    });
    inputPlayerName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        initGameFromForm();
      }
    });
  }

  // Pintasan Mode di Sidebar
  const configureAndStartMode = (topicVal, diffVal, countVal) => {
    if (selectTopic) selectTopic.value = topicVal;
    if (selectDifficulty) selectDifficulty.value = diffVal;
    if (selectCount) selectCount.value = String(countVal);

    showScreen('lobby');
    const arena = document.getElementById('circle-quest-arena');
    if (arena) arena.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!inputPlayerName || !inputPlayerName.value.trim()) {
      if (inputPlayerName) inputPlayerName.focus();
    } else {
      initGameFromForm();
    }
  };

  if (modeJourney) {
    modeJourney.addEventListener('click', () => configureAndStartMode('all', 'all', 8));
  }
  if (modeSpeed) {
    modeSpeed.addEventListener('click', () => configureAndStartMode('all', 'mudah', 5));
  }
  if (modeSimulation) {
    modeSimulation.addEventListener('click', () => configureAndStartMode('all', 'all', 10));
  }

  // --- KONTROL MODAL KONFIGURASI SUPABASE ---
  if (btnOpenSupabaseConfig) {
    btnOpenSupabaseConfig.addEventListener('click', openSupabaseModal);
  }
  if (btnCloseSupabaseModal) {
    btnCloseSupabaseModal.addEventListener('click', closeSupabaseModal);
  }
  if (btnCancelSupabaseModal) {
    btnCancelSupabaseModal.addEventListener('click', closeSupabaseModal);
  }
  if (supabaseModal) {
    supabaseModal.addEventListener('click', (e) => {
      if (e.target === supabaseModal) closeSupabaseModal();
    });
  }

  // Simpan & Uji Konfigurasi Supabase dari Modal
  if (btnSaveSupabaseConfig) {
    btnSaveSupabaseConfig.addEventListener('click', async () => {
      const url = cfgSupabaseUrl ? cfgSupabaseUrl.value.trim() : '';
      const key = cfgSupabaseKey ? cfgSupabaseKey.value.trim() : '';

      if (!url || !key) {
        if (cfgSupabaseStatus) {
          cfgSupabaseStatus.style.display = 'block';
          cfgSupabaseStatus.style.background = 'rgba(239, 68, 68, 0.15)';
          cfgSupabaseStatus.style.color = 'var(--color-danger)';
          cfgSupabaseStatus.textContent = 'Harap isi kedua bidang URL dan Public Anon Key.';
        }
        return;
      }

      if (key.toLowerCase().includes('service_role')) {
        if (cfgSupabaseStatus) {
          cfgSupabaseStatus.style.display = 'block';
          cfgSupabaseStatus.style.background = 'rgba(239, 68, 68, 0.15)';
          cfgSupabaseStatus.style.color = 'var(--color-danger)';
          cfgSupabaseStatus.textContent = '⚠️ Peringatan Keamanan: Jangan gunakan service_role key! Gunakan anon public key dari Dashboard Supabase demi keamanan.';
        }
        return;
      }

      btnSaveSupabaseConfig.disabled = true;
      btnSaveSupabaseConfig.innerHTML = '<span class="spinner-inline"></span> Menguji Koneksi Supabase...';

      try {
        MathVerseSupabase.saveConfig(url, key);
        const testRes = await MathVerseSupabase.testConnection();

        btnSaveSupabaseConfig.disabled = false;
        btnSaveSupabaseConfig.innerHTML = '<span>Tes & Simpan Konfigurasi</span>';

        if (testRes.ok) {
          if (cfgSupabaseStatus) {
            cfgSupabaseStatus.style.display = 'block';
            cfgSupabaseStatus.style.background = 'rgba(16, 185, 129, 0.15)';
            cfgSupabaseStatus.style.color = 'var(--color-success)';
            cfgSupabaseStatus.textContent = '✓ ' + testRes.message;
          }
          setTimeout(() => {
            closeSupabaseModal();
            renderLeaderboard();
          }, 1000);
        } else {
          if (cfgSupabaseStatus) {
            cfgSupabaseStatus.style.display = 'block';
            cfgSupabaseStatus.style.background = 'rgba(239, 68, 68, 0.15)';
            cfgSupabaseStatus.style.color = 'var(--color-danger)';
            cfgSupabaseStatus.textContent = '⚠️ ' + testRes.message;
          }
        }
      } catch (err) {
        btnSaveSupabaseConfig.disabled = false;
        btnSaveSupabaseConfig.innerHTML = '<span>Tes & Simpan Konfigurasi</span>';
        if (cfgSupabaseStatus) {
          cfgSupabaseStatus.style.display = 'block';
          cfgSupabaseStatus.style.background = 'rgba(239, 68, 68, 0.15)';
          cfgSupabaseStatus.style.color = 'var(--color-danger)';
          cfgSupabaseStatus.textContent = '⚠️ ' + err.message;
        }
      }
    });
  }

  // Tombol Segarkan Papan Peringkat
  if (btnRefreshLeaderboard) {
    btnRefreshLeaderboard.addEventListener('click', () => {
      renderLeaderboard();
    });
  }

  // Inisialisasi awal Leaderboard saat halaman dibuka
  renderLeaderboard();
});
