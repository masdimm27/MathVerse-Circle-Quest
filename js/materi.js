/**
 * MathVerse — Circle Quest
 * js/materi.js
 * 
 * Pengendali halaman Belajar Materi Geometri (Interactive Learning Module):
 * - Data kurikulum lengkap 8 bab materi lingkaran SMA
 * - Sinkronisasi progres belajar (localStorage)
 * - Generator diagram matematika SVG dinamis & slider kontrol interaktif
 * - Toggle tampilkan/sembunyikan pembahasan contoh soal
 * - Kuis latihan pemahaman per bab dengan umpan balik instan
 * - Navigasi antar bab & tautan kembali ke landing page
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Key untuk penyimpanan progres belajar di localStorage
  const PROGRESS_STORAGE_KEY = 'mathverse_completed_chapters';
  const THEME_STORAGE_KEY = 'mathverse_theme_preference';

  /* ==========================================================================
     1. TEMA TERANG / GELAP
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const rootElement = document.documentElement;

  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      rootElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      rootElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  };

  const toggleTheme = () => {
    const currentTheme = rootElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    rootElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  initTheme();

  /* ==========================================================================
     2. NAVIGASI MENU MOBILE
     ========================================================================== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinksList = document.getElementById('nav-links');

  if (mobileMenuToggle && navLinksList) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinksList.classList.toggle('active');
    });
  }

  /* ==========================================================================
     3. DATA KURIKULUM 8 BAB MATERI LINGKARAN SMA
     ========================================================================== */
  const chaptersData = [
    // BAB 1: Unsur-unsur Lingkaran
    {
      id: 1,
      slug: 'unsur_lingkaran',
      title: 'Unsur-unsur Lingkaran',
      category: 'Konsep Dasar',
      difficulty: 'Tingkat Dasar',
      objectives: [
        'Mengidentifikasi 8 unsur pembentuk lingkaran: titik pusat, jari-jari, diameter, busur, tali busur, tembereng, juring, dan apotema.',
        'Membedakan daerah juring (dibatasi 2 jari-jari dan busur) dengan tembereng (dibatasi tali busur dan busurnya).',
        'Memahami sifat tegak lurus apotema terhadap tali busur serta relasinya dengan Teorema Pythagoras.'
      ],
      theoryHtml: `
        <p><strong>Lingkaran</strong> adalah himpunan semua titik pada bidang datar yang berjarak sama terhadap suatu titik tertentu yang disebut <em>titik pusat</em>.</p>
        <p>Unsur-unsur esensial lingkaran terbagi menjadi dua kategori utama:</p>
        <div class="theory-callout-grid">
          <div class="theory-callout-card">
            <h4>1. Unsur Berupa Garis / Jarak:</h4>
            <ul>
              <li><strong>Titik Pusat (O):</strong> Titik acuan di tengah lingkaran.</li>
              <li><strong>Jari-jari (r):</strong> Jarak lurus dari pusat ke keliling lingkaran.</li>
              <li><strong>Diameter (d):</strong> Tali busur terpanjang yang melewati titik pusat ($d = 2r$).</li>
              <li><strong>Busur:</strong> Garis lengkung pada keliling lingkaran.</li>
              <li><strong>Tali Busur:</strong> Ruas garis lurus yang menghubungkan dua titik pada lingkaran.</li>
              <li><strong>Apotema (a):</strong> Jarak terpendek dari pusat tegak lurus ($90^\\circ$) ke tali busur.</li>
            </ul>
          </div>
          <div class="theory-callout-card">
            <h4>2. Unsur Berupa Daerah Bidang:</h4>
            <ul>
              <li><strong>Juring (Sektor):</strong> Daerah di dalam lingkaran yang dibatasi oleh dua jari-jari dan satu busur (seperti potongan pizza).</li>
              <li><strong>Tembereng:</strong> Daerah di dalam lingkaran yang dibatasi oleh sebuah tali busur dan busurnya.</li>
            </ul>
          </div>
        </div>
      `,
      formulas: [
        {
          name: 'Hubungan Diameter dan Jari-jari',
          formula: 'd = 2 \\cdot r \\iff r = \\frac{1}{2} \\cdot d',
          symbols: [
            { sym: 'd', name: 'Diameter lingkaran', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari lingkaran', unit: 'cm / m' }
          ]
        },
        {
          name: 'Panjang Apotema Lingkaran',
          formula: 'a = \\sqrt{r^2 - \\left(\\frac{t}{2}\\right)^2}',
          symbols: [
            { sym: 'a', name: 'Panjang apotema', unit: 'cm' },
            { sym: 'r', name: 'Jari-jari lingkaran', unit: 'cm' },
            { sym: 't', name: 'Panjang tali busur', unit: 'cm' }
          ]
        }
      ],
      interactiveType: 'unsur',
      example: {
        problem: 'Sebuah lingkaran berpusat di titik O memiliki jari-jari r = 10 cm. Terdapat sebuah tali busur AB dengan panjang 16 cm. Hitunglah panjang ruas garis apotema dari titik pusat O ke tali busur AB!',
        steps: [
          {
            title: 'Langkah 1: Identifikasi Data yang Diketahui',
            content: 'Jari-jari lingkaran: $r = 10\\text{ cm}$.<br>Panjang tali busur: $t = 16\\text{ cm}$.'
          },
          {
            title: 'Langkah 2: Memahami Sifat Apotema',
            content: 'Apotema tegak lurus terhadap tali busur dan membagi tali busur menjadi dua bagian sama panjang: $\\frac{t}{2} = \\frac{16}{2} = 8\\text{ cm}$.'
          },
          {
            title: 'Langkah 3: Penerapan Teorema Pythagoras',
            content: 'Segitiga siku-siku dibentuk oleh apotema ($a$), separuh tali busur ($8\\text{ cm}$), dan jari-jari ($10\\text{ cm}$):<br><code>a = √(r² - (t/2)²) = √(10² - 8²) = √(100 - 64) = √36 = 6 cm</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Jadi, panjang apotema dari pusat O ke tali busur AB adalah <strong>6 cm</strong>.'
          }
        ]
      },
      practice: {
        question: 'Ruas garis terpanjang yang dapat dibentuk di dalam lingkaran dan melalui titik pusat dinamakan ...',
        options: ['Apotema', 'Diameter', 'Jari-jari', 'Tali busur biasa'],
        correctAnswer: 1,
        explanation: 'Diameter adalah tali busur terpanjang pada lingkaran karena melalui titik pusat dengan panjang d = 2r.'
      }
    },

    // BAB 2: Keliling dan Panjang Busur
    {
      id: 2,
      slug: 'keliling_busur',
      title: 'Keliling & Panjang Busur',
      category: 'Sudut & Luas',
      difficulty: 'Tingkat Dasar',
      objectives: [
        'Menghitung keliling lingkaran menggunakan konstanta π = 22/7 atau 3,14.',
        'Memahami konsep bahwa panjang busur sebanding dengan besar sudut pusat terhadap satu putaran penuh (360°).',
        'Menyelesaikan soal kontekstual perhitungan panjang busur lingkaran.'
      ],
      theoryHtml: `
        <p><strong>Keliling lingkaran (K)</strong> adalah panjang lintasan tepi lingkaran dalam satu putaran penuh.</p>
        <p><strong>Busur lingkaran (s)</strong> adalah sebagian lengkungan dari keliling lingkaran yang diapit oleh sudut pusat tertentu ($\\alpha$). Karena lingkaran penuh bersudut $360^\\circ$, maka perbandingan panjang busur terhadap keliling sama dengan perbandingan sudut pusat terhadap $360^\\circ$:</p>
        <div class="theory-callout-card">
          <p style="font-size: 1.05rem; font-weight: 700; color: var(--color-accent);">
            $$\\frac{\\text{Panjang Busur } s}{\\text{Keliling } K} = \\frac{\\text{Sudut Pusat } \\alpha}{360^\\circ}$$
          </p>
          <p>Jika $\\alpha = 90^\\circ$, busur tersebut adalah $\\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}$ dari keliling total. Jika $\\alpha = 180^\\circ$, busur tersebut adalah setengah keliling lingkaran.</p>
        </div>
      `,
      formulas: [
        {
          name: 'Keliling Lingkaran',
          formula: 'K = 2 \\cdot \\pi \\cdot r = \\pi \\cdot d',
          symbols: [
            { sym: 'K', name: 'Keliling lingkaran', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari lingkaran', unit: 'cm / m' },
            { sym: 'd', name: 'Diameter lingkaran', unit: 'cm / m' },
            { sym: 'π', name: 'Konstanta pi (22/7 atau 3,14)', unit: '-' }
          ]
        },
        {
          name: 'Panjang Busur Lingkaran',
          formula: 's = \\frac{\\alpha}{360^\\circ} \\cdot 2 \\cdot \\pi \\cdot r',
          symbols: [
            { sym: 's', name: 'Panjang busur', unit: 'cm / m' },
            { sym: 'α', name: 'Sudut pusat yang menghadap busur', unit: 'derajat (°)' },
            { sym: 'r', name: 'Jari-jari lingkaran', unit: 'cm / m' }
          ]
        }
      ],
      interactiveType: 'busur',
      example: {
        problem: 'Diketahui sebuah lingkaran dengan jari-jari r = 21 cm. Tentukan keliling lingkaran dan panjang busur AB jika besar sudut pusat ∠AOB = 120°! (Gunakan π = 22/7)',
        steps: [
          {
            title: 'Langkah 1: Hitung Keliling Penuh Lingkaran',
            content: '<code>K = 2 · π · r = 2 · (22/7) · 21 = 2 · 22 · 3 = 132 cm</code>.'
          },
          {
            title: 'Langkah 2: Hitung Rasio Sudut Pusat',
            content: 'Rasio sudut = $\\frac{120^\\circ}{360^\\circ} = \\frac{1}{3}$. Artinya panjang busur adalah sepertiga keliling lingkaran.'
          },
          {
            title: 'Langkah 3: Hitung Panjang Busur AB',
            content: '<code>s = (120° / 360°) · K = (1/3) · 132 cm = 44 cm</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Keliling lingkaran adalah <strong>132 cm</strong> dan panjang busur AB adalah <strong>44 cm</strong>.'
          }
        ]
      },
      practice: {
        question: 'Sebuah lingkaran berjari-jari 14 cm memiliki sudut pusat 90°. Dengan π = 22/7, panjang busurnya adalah ...',
        options: ['11 cm', '22 cm', '44 cm', '88 cm'],
        correctAnswer: 1,
        explanation: 'Keliling = 2 · (22/7) · 14 = 88 cm. Panjang busur = (90/360) · 88 = 1/4 · 88 = 22 cm.'
      }
    },

    // BAB 3: Luas Juring dan Tembereng
    {
      id: 3,
      slug: 'luas_juring_tembereng',
      title: 'Luas Juring & Tembereng',
      category: 'Sudut & Luas',
      difficulty: 'Tingkat Menengah',
      objectives: [
        'Menghitung luas lingkaran penuh dan luas juring berdasarkan sudut pusat.',
        'Memahami hubungan luas tembereng sebagai selisih antara luas juring dan luas segitiga yang terbentuk.',
        'Membedakan konsep panjang busur (panjang garis) dengan luas juring & tembereng (luas bidang).'
      ],
      theoryHtml: `
        <p><strong>Luas Juring</strong> merupakan luas potongan bidang lingkaran yang dibatasi oleh dua jari-jari dan satu busur. Proporsinya sama persis dengan rasio sudut pusat terhadap $360^\\circ$:</p>
        <p style="font-weight: 700; color: var(--color-primary-light);">$$L_{\\text{juring}} = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$$</p>
        <p><strong>Luas Tembereng</strong> adalah daerah yang dibatasi oleh tali busur dan busurnya. Cara menghitung luas tembereng adalah dengan mengurangkan luas juring dengan luas segitiga yang dibentuk oleh kedua jari-jari:</p>
        <div class="theory-callout-card">
          <h4>Formula Penentu Tembereng:</h4>
          <p><code>Luas Tembereng = Luas Juring - Luas Segitiga AOB</code></p>
          <p>Untuk segitiga dengan sudut apit $\\alpha$: $L_{\\Delta} = \\frac{1}{2} r^2 \\sin(\\alpha)$. Khusus jika $\\alpha = 90^\\circ$ (segitiga siku-siku), maka $L_{\\Delta} = \\frac{1}{2} r^2$.</p>
        </div>
      `,
      formulas: [
        {
          name: 'Luas Lingkaran Penuh',
          formula: 'L = \\pi \\cdot r^2 = \\frac{1}{4} \\cdot \\pi \\cdot d^2',
          symbols: [
            { sym: 'L', name: 'Luas lingkaran penuh', unit: 'cm²' },
            { sym: 'r', name: 'Jari-jari lingkaran', unit: 'cm' }
          ]
        },
        {
          name: 'Luas Juring',
          formula: 'L_{\\text{juring}} = \\frac{\\alpha}{360^\\circ} \\cdot \\pi \\cdot r^2',
          symbols: [
            { sym: 'L_juring', name: 'Luas juring lingkaran', unit: 'cm²' },
            { sym: 'α', name: 'Sudut pusat juring', unit: 'derajat (°)' }
          ]
        },
        {
          name: 'Luas Tembereng',
          formula: 'L_{\\text{tembereng}} = L_{\\text{juring}} - L_{\\Delta} = \\left(\\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2\\right) - \\left(\\frac{1}{2} r^2 \\sin\\alpha\\right)',
          symbols: [
            { sym: 'L_tembereng', name: 'Luas tembereng lingkaran', unit: 'cm²' },
            { sym: 'L_Δ', name: 'Luas segitiga antara 2 jari-jari dan tali busur', unit: 'cm²' }
          ]
        }
      ],
      interactiveType: 'juring',
      example: {
        problem: 'Pada lingkaran berpusat O dengan jari-jari r = 14 cm, terdapat sudut siku-siku ∠AOB = 90°. Hitunglah: (a) Luas juring AOB, dan (b) Luas tembereng AB! (Gunakan π = 22/7)',
        steps: [
          {
            title: 'Langkah 1: Luas Lingkaran Penuh',
            content: '<code>L = π · r² = (22/7) · 14 · 14 = 22 · 2 · 14 = 616 cm²</code>.'
          },
          {
            title: 'Langkah 2: Luas Juring AOB (Sudut 90°)',
            content: '<code>L_juring = (90° / 360°) · 616 = (1/4) · 616 = 154 cm²</code>.'
          },
          {
            title: 'Langkah 3: Luas Segitiga Siku-Siku AOB',
            content: 'Karena siku-siku (90°), alas = r = 14 cm dan tinggi = r = 14 cm:<br><code>L_segitiga = (1/2) · 14 · 14 = 98 cm²</code>.'
          },
          {
            title: 'Langkah 4: Luas Tembereng',
            content: '<code>L_tembereng = L_juring - L_segitiga = 154 - 98 = 56 cm²</code>.'
          }
        ]
      },
      practice: {
        question: 'Sebuah juring memiliki sudut pusat 60° pada lingkaran berjari-jari 21 cm (π = 22/7). Berapakah luas juring tersebut?',
        options: ['154 cm²', '231 cm²', '308 cm²', '462 cm²'],
        correctAnswer: 1,
        explanation: 'Luas lingkaran = (22/7) · 21² = 1.386 cm². Luas juring = (60/360) · 1.386 = 1/6 · 1.386 = 231 cm².'
      }
    },

    // BAB 4: Sudut Pusat dan Sudut Keliling
    {
      id: 4,
      slug: 'sudut_pusat_keliling',
      title: 'Sudut Pusat & Sudut Keliling',
      category: 'Sudut & Luas',
      difficulty: 'Tingkat Menengah',
      objectives: [
        'Memahami hubungan matematis antara sudut pusat dan sudut keliling yang menghadap busur yang sama.',
        'Membuktikan bahwa semua sudut keliling yang menghadap busur yang sama besarnya sama.',
        'Menerapkan Teorema Thales: setiap sudut keliling yang menghadap diameter selalu 90° (siku-siku).'
      ],
      theoryHtml: `
        <p><strong>Sudut Pusat:</strong> Sudut yang titik sudutnya berimpit dengan titik pusat lingkaran dan kaki sudutnya adalah jari-jari.</p>
        <p><strong>Sudut Keliling:</strong> Sudut yang titik sudutnya terletak pada tepi (keliling) lingkaran dan kaki sudutnya merupakan tali busur.</p>
        <div class="theory-callout-grid">
          <div class="theory-callout-card">
            <h4>Teorema Utama:</h4>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent);">
              $$\\angle\\text{Pusat} = 2 \\times \\angle\\text{Keliling}$$
            </p>
            <p><em>(Syarat mutlak: keduanya harus menghadap busur lingkaran yang sama).</em></p>
          </div>
          <div class="theory-callout-card">
            <h4>Sifat Turunan Penting:</h4>
            <ul>
              <li>Semua sudut keliling yang menghadap busur yang sama bernilai <strong>sama besar</strong>.</li>
              <li>Sudut keliling yang menghadap <strong>diameter</strong> besarnya selalu <strong>90° (siku-siku)</strong>.</li>
              <li>Pada segi empat tali busur, jumlah dua sudut yang saling berhadapan adalah <strong>180°</strong>.</li>
            </ul>
          </div>
        </div>
      `,
      formulas: [
        {
          name: 'Relasi Sudut Pusat & Keliling',
          formula: '\\angle\\text{Pusat} = 2 \\cdot \\angle\\text{Keliling} \\iff \\angle\\text{Keliling} = \\frac{1}{2} \\cdot \\angle\\text{Pusat}',
          symbols: [
            { sym: '∠Pusat', name: 'Sudut yang bertitik puncak di pusat lingkaran (O)', unit: '°' },
            { sym: '∠Keliling', name: 'Sudut yang bertitik puncak di keliling lingkaran', unit: '°' }
          ]
        },
        {
          name: 'Teorema Thales (Menghadap Diameter)',
          formula: '\\angle ACB = \\frac{1}{2} \\cdot 180^\\circ = 90^\\circ \\quad (AB = \\text{diameter})',
          symbols: [
            { sym: 'AB', name: 'Ruas garis diameter (sudut pusat = 180°)', unit: '-' },
            { sym: '∠ACB', name: 'Sudut siku-siku di titik C', unit: '°' }
          ]
        }
      ],
      interactiveType: 'sudut',
      example: {
        problem: 'Pada suatu lingkaran berpusat di O, sudut pusat ∠AOB memiliki besar 110°. Titik C dan titik D terletak pada busur mayor lingkaran dan keduanya menghadap busur minor AB. Hitunglah besar ∠ACB dan ∠ADB!',
        steps: [
          {
            title: 'Langkah 1: Identifikasi Busur yang Dihadapi',
            content: 'Sudut pusat ∠AOB = 110° menghadap busur minor AB. Sudut keliling ∠ACB juga menghadap busur minor AB yang sama.'
          },
          {
            title: 'Langkah 2: Terapkan Teorema Sudut Keliling',
            content: '<code>∠ACB = (1/2) · ∠AOB = (1/2) · 110° = 55°</code>.'
          },
          {
            title: 'Langkah 3: Evaluasi Sudut Keliling Lain (∠ADB)',
            content: 'Karena sudut keliling ∠ADB juga menghadap busur minor AB yang sama, maka besar sudutnya identik:<br><code>∠ADB = ∠ACB = 55°</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Besar ∠ACB = <strong>55°</strong> dan besar ∠ADB = <strong>55°</strong>.'
          }
        ]
      },
      practice: {
        question: 'Jika suatu sudut keliling yang menghadap busur PQ bernilai 42°, berapakah besar sudut pusat yang menghadap busur PQ tersebut?',
        options: ['21°', '42°', '84°', '138°'],
        correctAnswer: 2,
        explanation: 'Sudut pusat = 2 · sudut keliling = 2 · 42° = 84°.'
      }
    },

    // BAB 5: Garis Singgung Lingkaran
    {
      id: 5,
      slug: 'garis_singgung',
      title: 'Garis Singgung Lingkaran',
      category: 'Garis Singgung',
      difficulty: 'Tingkat Menengah',
      objectives: [
        'Memahami sifat tegak lurus (90°) antara jari-jari dan garis singgung di titik kontak singgung.',
        'Menerapkan Teorema Pythagoras untuk menentukan panjang garis singgung dari titik luar ke lingkaran.',
        'Menganalisis sifat kesamaan panjang dua garis singgung yang ditarik dari satu titik luar yang sama.'
      ],
      theoryHtml: `
        <p><strong>Garis Singgung Lingkaran</strong> adalah garis lurus yang memotong atau menyentuh lingkaran tepat pada <em>satu titik</em> saja. Titik perpotongan ini dinamakan <strong>titik singgung</strong>.</p>
        <div class="theory-callout-card">
          <h4>Sifat Fundamental Garis Singgung:</h4>
          <p>Jari-jari lingkaran yang ditarik ke titik singgung <strong>selalu tegak lurus ($90^\\circ$)</strong> terhadap garis singgung tersebut.</p>
          <p>Akibatnya, jika ditarik titik $P$ di luar lingkaran dan dihubungkan ke pusat $O$, terbentuk <strong>segitiga siku-siku $OPT$</strong> dengan hipotenusa jarak titik luar ($p = OP$), sisi tegak jari-jari ($r = OT$), dan sisi alas garis singgung ($d = PT$).</p>
        </div>
      `,
      formulas: [
        {
          name: 'Panjang Garis Singgung dari Titik Luar',
          formula: 'd = \\sqrt{p^2 - r^2}',
          symbols: [
            { sym: 'd', name: 'Panjang garis singgung (PT)', unit: 'cm / m' },
            { sym: 'p', name: 'Jarak titik luar ke titik pusat (OP)', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari lingkaran (OT)', unit: 'cm / m' }
          ]
        }
      ],
      interactiveType: 'singgung',
      example: {
        problem: 'Titik P berada di luar lingkaran berpusat O yang memiliki jari-jari r = 7 cm. Jarak titik P ke pusat O adalah p = 25 cm. Dari titik P ditarik garis singgung yang menyentuh lingkaran di titik T. Hitunglah panjang ruas garis singgung PT!',
        steps: [
          {
            title: 'Langkah 1: Identifikasi Komponen Segitiga Siku-Siku',
            content: 'Segitiga OPT siku-siku di titik T karena jari-jari OT ⊥ garis singgung PT.<br>Hipotenusa: $OP = p = 25\\text{ cm}$. Sisi tegak: $OT = r = 7\\text{ cm}$.'
          },
          {
            title: 'Langkah 2: Terapkan Teorema Pythagoras',
            content: '<code>PT² = OP² - OT² = 25² - 7² = 625 - 49 = 576</code>.'
          },
          {
            title: 'Langkah 3: Penarikan Akar Kuadrat',
            content: '<code>PT = √576 = 24 cm</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Panjang ruas garis singgung PT adalah <strong>24 cm</strong>.'
          }
        ]
      },
      practice: {
        question: 'Sebuah titik A berjarak 13 cm dari titik pusat lingkaran. Jika jari-jari lingkaran 5 cm, maka panjang garis singgung dari titik A adalah ...',
        options: ['8 cm', '10 cm', '12 cm', '14 cm'],
        correctAnswer: 2,
        explanation: 'd = √(p² - r²) = √(13² - 5²) = √(169 - 25) = √144 = 12 cm.'
      }
    },

    // BAB 6: Garis Singgung Persekutuan Luar (GSPL)
    {
      id: 6,
      slug: 'gspl',
      title: 'Garis Singgung Persekutuan Luar',
      category: 'Garis Singgung',
      difficulty: 'Tingkat Lanjutan',
      objectives: [
        'Mengidentifikasi kedudukan dua lingkaran dan ruas garis singgung persekutuan luar (GSPL).',
        'Menurunkan rumus GSPL menggunakan garis bantu segitiga siku-siku selisih jari-jari (R - r).',
        'Menyelesaikan soal bertingkat terkait panjang GSPL dan jarak antar pusat lingkaran.'
      ],
      theoryHtml: `
        <p><strong>Garis Singgung Persekutuan Luar (GSPL)</strong> adalah garis lurus yang menyinggung dua lingkaran sekaligus di bagian sisi luar tanpa memotong ruas garis hubung kedua pusat.</p>
        <p>Misalkan ada dua lingkaran dengan jari-jari $R$ (lingkaran besar) dan $r$ (lingkaran kecil), serta jarak antara kedua titik pusat adalah $p$.</p>
        <div class="theory-callout-card">
          <h4>Konstruksi Segitiga Siku-Siku Bantu:</h4>
          <p>Jika kita menarik garis sejajar GSPL dari pusat lingkaran kecil ke jari-jari lingkaran besar, terbentuk segitiga siku-siku dengan:</p>
          <ul>
            <li><strong>Sisi miring (Hipotenusa):</strong> Jarak antar titik pusat ($p$).</li>
            <li><strong>Sisi tegak:</strong> Selisih kedua jari-jari ($R - r$).</li>
            <li><strong>Sisi alas:</strong> Panjang GSPL ($d$).</li>
          </ul>
        </div>
      `,
      formulas: [
        {
          name: 'Rumus Panjang GSPL',
          formula: 'd = \\sqrt{p^2 - (R - r)^2}',
          symbols: [
            { sym: 'd', name: 'Panjang garis singgung persekutuan luar', unit: 'cm / m' },
            { sym: 'p', name: 'Jarak antara pusat lingkaran 1 dan pusat lingkaran 2', unit: 'cm / m' },
            { sym: 'R', name: 'Jari-jari lingkaran besar', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari lingkaran kecil', unit: 'cm / m' }
          ]
        }
      ],
      interactiveType: 'gspl',
      example: {
        problem: 'Dua buah lingkaran memiliki jari-jari masing-masing R = 14 cm dan r = 4 cm. Jarak antara kedua pusat lingkaran adalah p = 26 cm. Hitunglah panjang garis singgung persekutuan luar (GSPL) kedua lingkaran tersebut!',
        steps: [
          {
            title: 'Langkah 1: Hitung Selisih Jari-Jari (R - r)',
            content: '<code>Selisih jari-jari = R - r = 14 - 4 = 10 cm</code>.'
          },
          {
            title: 'Langkah 2: Terapkan Rumus GSPL',
            content: '<code>d = √(p² - (R - r)²) = √(26² - 10²)</code>.'
          },
          {
            title: 'Langkah 3: Hitung Nilai Kuadrat & Pengurangan',
            content: '<code>26² = 676, dan 10² = 100.<br>d = √(676 - 100) = √576 = 24 cm</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Panjang garis singgung persekutuan luar (GSPL) adalah <strong>24 cm</strong>.'
          }
        ]
      },
      practice: {
        question: 'Dua lingkaran memiliki R = 13 cm dan r = 5 cm. Jarak antara kedua pusat adalah 17 cm. Panjang garis singgung persekutuan luar adalah ...',
        options: ['12 cm', '14 cm', '15 cm', '16 cm'],
        correctAnswer: 2,
        explanation: 'R - r = 13 - 5 = 8 cm. d = √(17² - 8²) = √(289 - 64) = √225 = 15 cm.'
      }
    },

    // BAB 7: Garis Singgung Persekutuan Dalam (GSPD)
    {
      id: 7,
      slug: 'gspd',
      title: 'Garis Singgung Persekutuan Dalam',
      category: 'Garis Singgung',
      difficulty: 'Tingkat Lanjutan',
      objectives: [
        'Mengidentifikasi garis singgung persekutuan dalam (GSPD) yang menyilang di antara dua lingkaran.',
        'Memahami perbedaan mendasar dengan GSPL: pada GSPD, jari-jari dijumlahkan (R + r).',
        'Menghitung panjang GSPD dengan rumus matematis secara teliti.'
      ],
      theoryHtml: `
        <p><strong>Garis Singgung Persekutuan Dalam (GSPD)</strong> adalah garis lurus yang menyinggung dua lingkaran dan memotong garis hubung antar kedua pusat lingkaran (menyilang di antara dua lingkaran).</p>
        <div class="theory-callout-card">
          <h4>Perbedaan Kunci: GSPL vs GSPD:</h4>
          <ul>
            <li><strong>GSPL (Luar):</strong> Menggunakan <em>selisih</em> jari-jari: $(R - r)$.</li>
            <li><strong>GSPD (Dalam):</strong> Menggunakan <em>jumlah</em> jari-jari: $(R + r)$.</li>
          </ul>
          <p>Karena jari-jari dijumlahkan, untuk jarak pusat $p$ yang sama, panjang GSPD selalu <em>lebih pendek</em> daripada panjang GSPL, dan kedua lingkaran harus terpisah cukup jauh ($p > R + r$).</p>
        </div>
      `,
      formulas: [
        {
          name: 'Rumus Panjang GSPD',
          formula: 'd = \\sqrt{p^2 - (R + r)^2}',
          symbols: [
            { sym: 'd', name: 'Panjang garis singgung persekutuan dalam', unit: 'cm / m' },
            { sym: 'p', name: 'Jarak antara titik pusat kedua lingkaran', unit: 'cm / m' },
            { sym: 'R', name: 'Jari-jari lingkaran 1', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari lingkaran 2', unit: 'cm / m' }
          ]
        }
      ],
      interactiveType: 'gspd',
      example: {
        problem: 'Dua buah lingkaran terpisah memiliki jari-jari R = 8 cm dan r = 4 cm. Jarak antara pusat kedua lingkaran adalah p = 15 cm. Tentukan panjang garis singgung persekutuan dalam (GSPD)!',
        steps: [
          {
            title: 'Langkah 1: Hitung Jumlah Kedua Jari-Jari (R + r)',
            content: '<code>R + r = 8 + 4 = 12 cm</code>.'
          },
          {
            title: 'Langkah 2: Terapkan Rumus GSPD',
            content: '<code>d = √(p² - (R + r)²) = √(15² - 12²)</code>.'
          },
          {
            title: 'Langkah 3: Hitung Kuadrat dan Hasil Akhir',
            content: '<code>15² = 225, 12² = 144.<br>d = √(225 - 144) = √81 = 9 cm</code>.'
          },
          {
            title: 'Langkah 4: Kesimpulan',
            content: 'Panjang garis singgung persekutuan dalam (GSPD) adalah <strong>9 cm</strong>.'
          }
        ]
      },
      practice: {
        question: 'Dua lingkaran memiliki jari-jari R = 7 cm dan r = 3 cm. Jika jarak kedua pusat lingkaran 26 cm, panjang GSPD-nya adalah ...',
        options: ['20 cm', '22 cm', '24 cm', '25 cm'],
        correctAnswer: 2,
        explanation: 'R + r = 7 + 3 = 10 cm. d = √(26² - 10²) = √(676 - 100) = √576 = 24 cm.'
      }
    },

    // BAB 8: Soal Aplikasi dan Gabungan Materi Lingkaran
    {
      id: 8,
      slug: 'aplikasi_campuran',
      title: 'Aplikasi & Gabungan Materi',
      category: 'Tantangan Master',
      difficulty: 'Tantangan Master',
      objectives: [
        'Menerapkan konsep GSPL dan GSPD pada mekanika sabuk transmisi roda gigi dan rantai mesin.',
        'Menghitung panjang total sabuk/rantai katrol terbuka dengan menjumlahkan 2 rentang garis lurus dan 2 busur kontak.',
        'Menganalisis soal bertingkat kombinasi sudut, luas, dan garis singgung dalam pemecahan masalah nyata.'
      ],
      theoryHtml: `
        <p>Dalam rekayasa teknik dan kehidupan nyata, konsep lingkaran sangat banyak dijumpai pada transmisi daya mesin motor, rantai sepeda, puli katrol, serta roda gigi jam mekanis.</p>
        <div class="theory-callout-card">
          <h4>Sistem Sabuk Katrol Terbuka (Open Belt Drive):</h4>
          <p>Dua roda katrol berputar searah dihubungkan oleh sabuk terbuka:</p>
          <ul>
            <li>Panjang bagian sabuk yang lurus bebas adalah sama persis dengan <strong>panjang GSPL ($d$)</strong>. Karena terdapat bentangan atas dan bawah, panjang rentang lurus total adalah $2d$.</li>
            <li>Panjang sabuk yang menempel pada roda adalah <strong>panjang busur kontak</strong> pada roda besar dan roda kecil.</li>
            <li>Panjang total sabuk = <code>2 · d_GSPL + Busur Kontak R + Busur Kontak r</code>.</li>
          </ul>
        </div>
      `,
      formulas: [
        {
          name: 'Panjang Rentang Lurus Bebas Sabuk',
          formula: 'd = \\sqrt{p^2 - (R - r)^2} \\quad \\text{(Panjang 1 Rentang)}',
          symbols: [
            { sym: 'd', name: 'Panjang rentang lurus bebas', unit: 'cm / m' },
            { sym: 'p', name: 'Jarak antar sumbu poros roda', unit: 'cm / m' },
            { sym: 'R', name: 'Jari-jari roda katrol besar', unit: 'cm / m' },
            { sym: 'r', name: 'Jari-jari roda katrol kecil', unit: 'cm / m' }
          ]
        },
        {
          name: 'Total Dua Rentang Lurus Sabuk',
          formula: 'L_{\\text{rentang}} = 2 \\cdot d = 2 \\cdot \\sqrt{p^2 - (R - r)^2}',
          symbols: [
            { sym: 'L_rentang', name: 'Total panjang dua bentangan bebas (atas + bawah)', unit: 'cm / m' }
          ]
        }
      ],
      interactiveType: 'aplikasi',
      example: {
        problem: 'Dua buah puli mesin masing-masing memiliki jari-jari R = 20 cm dan r = 5 cm. Jarak antara kedua poros poros katrol adalah p = 39 cm. Tentukan total panjang bagian sabuk lurus yang bebas (atas dan bawah) yang menghubungkan kedua puli tersebut!',
        steps: [
          {
            title: 'Langkah 1: Identifikasi Model Geometri',
            content: 'Sabuk terbuka bebas antara dua puli memiliki panjang yang sama dengan garis singgung persekutuan luar (GSPL).'
          },
          {
            title: 'Langkah 2: Hitung Selisih Jari-Jari (R - r)',
            content: '<code>Selisih jari-jari = 20 - 5 = 15 cm</code>.'
          },
          {
            title: 'Langkah 3: Hitung Panjang 1 Bentangan GSPL (d)',
            content: '<code>d = √(39² - 15²) = √(1521 - 225) = √1296 = 36 cm</code>.'
          },
          {
            title: 'Langkah 4: Hitung Total Dua Bentangan Bebas',
            content: 'Karena ada bentangan atas dan bentangan bawah:<br><code>Total rentang lurus = 2 · d = 2 · 36 = 72 cm</code>.'
          }
        ]
      },
      practice: {
        question: 'Dua buah roda gigi sepeda berjari-jari 15 cm dan 3 cm dihubungkan dengan rantai terbuka. Jarak pusat kedua poros adalah 20 cm. Panjang bentangan lurus rantai antara kedua roda gigi adalah ...',
        options: ['12 cm', '16 cm', '24 cm', '32 cm'],
        correctAnswer: 1,
        explanation: 'd = √(20² - (15 - 3)²) = √(400 - 144) = √256 = 16 cm.'
      }
    }
  ];

  /* ==========================================================================
     4. MANAJEMEN STATUS PROGRES BELAJAR (localStorage)
     ========================================================================== */
  const getCompletedChapters = () => {
    try {
      const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCompletedChapters = (list) => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(list));
    updateProgressDisplay();
    updateSidebarItems();
  };

  const isChapterCompleted = (chapterId) => {
    const list = getCompletedChapters();
    return list.includes(chapterId);
  };

  const toggleChapterCompletion = (chapterId) => {
    let list = getCompletedChapters();
    if (list.includes(chapterId)) {
      list = list.filter(id => id !== chapterId);
    } else {
      list.push(chapterId);
    }
    saveCompletedChapters(list);
    updateCompletionButtonState(chapterId);
  };

  const resetAllProgress = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang seluruh progres belajar?')) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      updateProgressDisplay();
      updateSidebarItems();
      const currentBab = getCurrentChapterFromUrl();
      updateCompletionButtonState(currentBab);
    }
  };

  const updateProgressDisplay = () => {
    const list = getCompletedChapters();
    const count = list.length;
    const total = chaptersData.length;
    const percent = Math.round((count / total) * 100);

    const countEl = document.getElementById('progress-count');
    const percentEl = document.getElementById('progress-percent');
    const barEl = document.getElementById('progress-bar-fill');

    if (countEl) countEl.textContent = count;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (barEl) barEl.style.width = `${percent}%`;
  };

  /* ==========================================================================
     5. NAVIGASI BAB & URL PARAMETER
     ========================================================================== */
  const getCurrentChapterFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const babParam = parseInt(params.get('bab'), 10);
    if (babParam >= 1 && babParam <= chaptersData.length) {
      return babParam;
    }
    return 1; // Default Bab 1
  };

  const setCurrentChapterInUrl = (chapterId) => {
    const url = new URL(window.location);
    url.searchParams.set('bab', chapterId);
    window.history.pushState({}, '', url);
  };

  /* ==========================================================================
     6. RENDER SIDEBAR & KONTEN BAB
     ========================================================================== */
  const sidebarList = document.getElementById('sidebar-chapter-list');
  const mainContentArea = document.getElementById('chapter-content-container');
  const btnResetProgress = document.getElementById('btn-reset-progress');

  if (btnResetProgress) {
    btnResetProgress.addEventListener('click', resetAllProgress);
  }

  const renderSidebar = () => {
    if (!sidebarList) return;
    sidebarList.innerHTML = '';

    const currentBab = getCurrentChapterFromUrl();
    const completedList = getCompletedChapters();

    chaptersData.forEach((ch) => {
      const isCompleted = completedList.includes(ch.id);
      const isActive = ch.id === currentBab;

      const item = document.createElement('button');
      item.className = `sidebar-chapter-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      item.setAttribute('data-bab', ch.id);
      item.setAttribute('aria-label', `Pilih Bab ${ch.id}: ${ch.title}`);

      item.innerHTML = `
        <div class="sidebar-item-left">
          <span class="sidebar-bab-badge">Bab 0${ch.id}</span>
          <span class="sidebar-bab-title">${ch.title}</span>
        </div>
        <div class="sidebar-item-status">
          ${isCompleted 
            ? '<span class="status-icon-check" title="Selesai">✓</span>' 
            : '<span class="status-icon-dot" title="Belum Selesai">○</span>'}
        </div>
      `;

      item.addEventListener('click', () => {
        navigateToChapter(ch.id);
      });

      sidebarList.appendChild(item);
    });
  };

  const updateSidebarItems = () => {
    const currentBab = getCurrentChapterFromUrl();
    const completedList = getCompletedChapters();
    const items = document.querySelectorAll('.sidebar-chapter-item');

    items.forEach((item) => {
      const id = parseInt(item.getAttribute('data-bab'), 10);
      const isCompleted = completedList.includes(id);
      const isActive = id === currentBab;

      item.classList.toggle('active', isActive);
      item.classList.toggle('completed', isCompleted);

      const statusContainer = item.querySelector('.sidebar-item-status');
      if (statusContainer) {
        statusContainer.innerHTML = isCompleted
          ? '<span class="status-icon-check" title="Selesai">✓</span>'
          : '<span class="status-icon-dot" title="Belum Selesai">○</span>';
      }
    });
  };

  const updateCompletionButtonState = (chapterId) => {
    const isCompleted = isChapterCompleted(chapterId);
    const btnTop = document.getElementById('btn-toggle-complete');
    const btnBottom = document.getElementById('btn-complete-bottom');

    const updateBtn = (btn) => {
      if (!btn) return;
      if (isCompleted) {
        btn.classList.add('btn-completed');
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Bab Selesai</span>
        `;
      } else {
        btn.classList.remove('btn-completed');
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <span>Tandai Selesai</span>
        `;
      }
    };

    updateBtn(btnTop);
    updateBtn(btnBottom);
  };

  const navigateToChapter = (chapterId) => {
    setCurrentChapterInUrl(chapterId);
    updateSidebarItems();
    renderChapterContent(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ==========================================================================
     7. RENDER DETAIL BAB UTAMA
     ========================================================================== */
  const renderChapterContent = (chapterId) => {
    const ch = chaptersData.find(c => c.id === chapterId);
    if (!ch || !mainContentArea) return;

    // Update Breadcrumb
    const breadcrumbBab = document.getElementById('breadcrumb-current-bab');
    if (breadcrumbBab) breadcrumbBab.textContent = `Bab 0${ch.id}: ${ch.title}`;

    const prevBabId = ch.id > 1 ? ch.id - 1 : null;
    const nextBabId = ch.id < chaptersData.length ? ch.id + 1 : null;

    // Template HTML Bab
    let formulasHtml = '';
    ch.formulas.forEach((f) => {
      let symbolsList = '';
      f.symbols.forEach((s) => {
        symbolsList += `
          <div class="symbol-pill">
            <span class="symbol-code">${s.sym}</span>
            <span class="symbol-desc">${s.name} ${s.unit !== '-' ? `<em>(${s.unit})</em>` : ''}</span>
          </div>
        `;
      });

      formulasHtml += `
        <div class="formula-box-card">
          <div class="formula-title">${f.name}</div>
          <div class="formula-expression">${f.formula}</div>
          <div class="symbols-breakdown-grid">
            ${symbolsList}
          </div>
        </div>
      `;
    });

    let stepsHtml = '';
    ch.example.steps.forEach((st, idx) => {
      stepsHtml += `
        <div class="example-step-item">
          <div class="step-num">${idx + 1}</div>
          <div class="step-content">
            <h5>${st.title}</h5>
            <p>${st.content}</p>
          </div>
        </div>
      `;
    });

    let practiceOptionsHtml = '';
    const letters = ['A', 'B', 'C', 'D'];
    ch.practice.options.forEach((opt, idx) => {
      practiceOptionsHtml += `
        <button class="practice-opt-btn" data-index="${idx}">
          <span class="opt-letter">${letters[idx]}</span>
          <span class="opt-text">${opt}</span>
        </button>
      `;
    });

    mainContentArea.innerHTML = `
      <!-- Header Bab -->
      <header class="chapter-content-header">
        <div class="chapter-header-badges">
          <span class="badge-pill">${ch.category}</span>
          <span class="badge-pill badge-pill-cyan">${ch.difficulty}</span>
        </div>
        <div class="chapter-title-row">
          <h1 class="chapter-main-title">Bab 0${ch.id}: ${ch.title}</h1>
          <button id="btn-toggle-complete" class="btn btn-secondary chapter-mark-btn" aria-label="Tandai status penyelesaian bab">
            <!-- Icon diatur oleh updateCompletionButtonState -->
          </button>
        </div>
      </header>

      <!-- 1. Tujuan Pembelajaran -->
      <section class="chapter-card-section" aria-labelledby="heading-objectives">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          <h2 id="heading-objectives">Tujuan Pembelajaran</h2>
        </div>
        <ul class="learning-objectives-list">
          ${ch.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
      </section>

      <!-- 2. Penjelasan Konsep Intuitif -->
      <section class="chapter-card-section" aria-labelledby="heading-concept">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <h2 id="heading-concept">Penjelasan Konsep</h2>
        </div>
        <div class="concept-body-text">
          ${ch.theoryHtml}
        </div>
      </section>

      <!-- 3. Rumus & Makna Simbol -->
      <section class="chapter-card-section" aria-labelledby="heading-formulas">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
          <h2 id="heading-formulas">Rumus Matematis & Makna Simbol</h2>
        </div>
        <div class="formulas-container">
          ${formulasHtml}
        </div>
      </section>

      <!-- 4. Diagram Geometri Interaktif & Simulasi Dinamis -->
      <section class="chapter-card-section" id="interactive-diagram-section" aria-labelledby="heading-diagram">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <h2 id="heading-diagram">Diagram Matematika Interaktif</h2>
        </div>
        <p class="diagram-subtitle">Ubah nilai parameter slider di bawah ini untuk melihat perubahan diagram geometri dan hasil perhitungannya secara langsung.</p>
        
        <div class="interactive-sandbox-container">
          <div class="interactive-svg-wrapper" id="svg-stage-container">
            <!-- SVG dinamis disisipkan di sini -->
          </div>

          <div class="interactive-controls-panel" id="sliders-controls-container">
            <!-- Kontrol slider disisipkan di sini -->
          </div>

          <div class="interactive-stats-bar" id="live-stats-bar">
            <!-- Output nilai numerik seketika -->
          </div>
        </div>
      </section>

      <!-- 5. Contoh Soal & Pembahasan Bertahap -->
      <section class="chapter-card-section" aria-labelledby="heading-example">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <h2 id="heading-example">Contoh Soal & Pembahasan</h2>
        </div>
        
        <div class="example-problem-box">
          <div class="problem-label">Soal Pemahaman:</div>
          <p class="problem-statement">${ch.example.problem}</p>
          
          <button id="btn-toggle-solution" class="btn btn-secondary solution-toggle-btn" aria-expanded="false">
            <span>Tampilkan Pembahasan</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <div class="example-solution-drawer" id="example-solution-drawer">
            <div class="steps-flow-container">
              ${stepsHtml}
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Latihan Pemahaman Singkat -->
      <section class="chapter-card-section" aria-labelledby="heading-practice">
        <div class="section-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
          <h2 id="heading-practice">Latihan Pemahaman Singkat</h2>
        </div>

        <div class="practice-quiz-box" id="practice-quiz-box">
          <p class="practice-question-text">${ch.practice.question}</p>
          <div class="practice-options-grid">
            ${practiceOptionsHtml}
          </div>
          <div class="practice-feedback-alert" id="practice-feedback-alert"></div>
        </div>
      </section>

      <!-- 7. Navigasi Bab & Tombol Selesai Bawah -->
      <footer class="chapter-nav-footer">
        <div>
          ${prevBabId 
            ? `<button class="btn btn-secondary" id="btn-prev-chapter">← Bab 0${prevBabId}</button>` 
            : `<a href="index.html" class="btn btn-secondary">← Ke Beranda</a>`}
        </div>

        <div>
          <button id="btn-complete-bottom" class="btn btn-primary">
            <!-- Icon & text diatur oleh updateCompletionButtonState -->
          </button>
        </div>

        <div>
          ${nextBabId 
            ? `<button class="btn btn-secondary" id="btn-next-chapter">Bab 0${nextBabId} →</button>` 
            : `<a href="index.html#challenges" class="btn btn-primary">Mulai Uji Tantangan 🚀</a>`}
        </div>
      </footer>
    `;

    // Pasang Event Listeners
    initChapterInteractions(ch);
    updateCompletionButtonState(ch.id);

    // Listener Tombol Selesai
    const btnTop = document.getElementById('btn-toggle-complete');
    const btnBottom = document.getElementById('btn-complete-bottom');
    if (btnTop) btnTop.addEventListener('click', () => toggleChapterCompletion(ch.id));
    if (btnBottom) btnBottom.addEventListener('click', () => toggleChapterCompletion(ch.id));

    // Listener Navigasi Sebelumnya / Berikutnya
    const btnPrev = document.getElementById('btn-prev-chapter');
    const btnNext = document.getElementById('btn-next-chapter');
    if (btnPrev && prevBabId) btnPrev.addEventListener('click', () => navigateToChapter(prevBabId));
    if (btnNext && nextBabId) btnNext.addEventListener('click', () => navigateToChapter(nextBabId));

    // Listener Toggle Pembahasan
    const btnToggleSol = document.getElementById('btn-toggle-solution');
    const solutionDrawer = document.getElementById('example-solution-drawer');
    if (btnToggleSol && solutionDrawer) {
      btnToggleSol.addEventListener('click', () => {
        const isExpanded = btnToggleSol.getAttribute('aria-expanded') === 'true';
        btnToggleSol.setAttribute('aria-expanded', String(!isExpanded));
        solutionDrawer.classList.toggle('active', !isExpanded);
        btnToggleSol.querySelector('span').textContent = !isExpanded 
          ? 'Sembunyikan Pembahasan' 
          : 'Tampilkan Pembahasan';
      });
    }

    // Listener Kuis Latihan Pemahaman
    const optButtons = document.querySelectorAll('.practice-opt-btn');
    const feedbackAlert = document.getElementById('practice-feedback-alert');

    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosenIdx = parseInt(btn.getAttribute('data-index'), 10);
        const isCorrect = chosenIdx === ch.practice.correctAnswer;

        optButtons.forEach((b, idx) => {
          b.disabled = true;
          if (idx === ch.practice.correctAnswer) {
            b.classList.add('correct');
          } else if (idx === chosenIdx) {
            b.classList.add('wrong');
          }
        });

        if (feedbackAlert) {
          feedbackAlert.className = `practice-feedback-alert active ${isCorrect ? 'alert-success' : 'alert-danger'}`;
          feedbackAlert.innerHTML = `
            <strong>${isCorrect ? '✓ Jawaban Anda Benar!' : '✗ Jawaban Belum Tepat'}</strong>
            <p>${ch.practice.explanation}</p>
          `;
        }
      });
    });
  };

  /* ==========================================================================
     8. ENGINE DIAGRAM GEOMETRI INTERAKTIF DINAMIS (SVG + JS)
     ========================================================================== */
  const getGeometryModule = () => {
    if (typeof MathVerseGeometry !== 'undefined' && MathVerseGeometry) {
      return MathVerseGeometry;
    }
    if (typeof window !== 'undefined' && window.MathVerseGeometry) {
      return window.MathVerseGeometry;
    }
    if (typeof globalThis !== 'undefined' && globalThis.MathVerseGeometry) {
      return globalThis.MathVerseGeometry;
    }
    return null;
  };

  const initChapterInteractions = (chapter) => {
    const stageContainer = document.getElementById('svg-stage-container');
    const controlsContainer = document.getElementById('sliders-controls-container');
    const statsBar = document.getElementById('live-stats-bar');

    if (!stageContainer || !controlsContainer || !statsBar) {
      console.warn('Wadah elemen diagram geometri tidak ditemukan pada DOM.');
      return;
    }

    // Bersihkan kontainer sebelum inisialisasi bab baru
    stageContainer.innerHTML = '';
    controlsContainer.innerHTML = '';
    statsBar.innerHTML = '';

    const geom = getGeometryModule();
    if (!geom) {
      console.error('Modul MathVerseGeometry tidak berhasil dimuat.');
      stageContainer.innerHTML = `
        <div class="diagram-error-msg">
          <p><strong>Gagal memuat modul kalkulasi geometri.</strong></p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Pastikan file <code>js/geometry.js</code> berhasil dimuat tanpa pemblokiran.</p>
        </div>
      `;
      return;
    }

    try {
      // Switch berdasarkan tipe interaktif bab
      switch (chapter.interactiveType) {
        case 'unsur':
          initUnsurInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'busur':
          initBusurInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'juring':
          initJuringInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'sudut':
          initSudutInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'singgung':
          initSinggungInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'gspl':
          initGSPLInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'gspd':
          initGSPDInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        case 'aplikasi':
          initAplikasiInteractive(stageContainer, controlsContainer, statsBar, geom);
          break;
        default:
          console.warn('Tipe interaktif tidak dikenal:', chapter.interactiveType);
          stageContainer.innerHTML = '<p class="error-msg">Tipe interaktif tidak dikenali.</p>';
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat merender diagram bab ' + chapter.id + ':', err);
      stageContainer.innerHTML = `
        <div class="diagram-error-msg">
          <p><strong>Terjadi kendala saat menampilkan diagram:</strong></p>
          <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-danger);">${err.message || err}</p>
        </div>
      `;
    }
  };

  /* --- INTERAKTIF BAB 1: UNSUR LINGKARAN --- */
  const initUnsurInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="control-desc-note">
        <strong>Pilih Elemen:</strong> Klik tombol unsur di bawah ini untuk menyorot bagian pada diagram dan melihat sifat matematisnya.
      </div>
      <div class="element-filter-buttons" role="toolbar">
        <button class="elem-btn active" data-target="elem-center">Titik Pusat (O)</button>
        <button class="elem-btn" data-target="elem-radius">Jari-jari (r)</button>
        <button class="elem-btn" data-target="elem-diameter">Diameter (d)</button>
        <button class="elem-btn" data-target="elem-chord">Tali Busur</button>
        <button class="elem-btn" data-target="elem-apothem">Apotema</button>
        <button class="elem-btn" data-target="elem-arc">Busur</button>
        <button class="elem-btn" data-target="elem-sector">Juring</button>
        <button class="elem-btn" data-target="elem-segment">Tembereng</button>
      </div>
    `;

    const svgWidth = 400;
    const svgHeight = 300;
    const cx = 200;
    const cy = 150;
    const r = 100;

    // Koordinat busur & tali busur (sudut -30° s/d 90°)
    const startAngle = -30;
    const endAngle = 90;
    const p1 = geom.getCirclePoint(cx, cy, r, startAngle);
    const p2 = geom.getCirclePoint(cx, cy, r, endAngle);

    // Titik tengah tali busur untuk apotema
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const sectorPath = geom.generateSectorPath(cx, cy, r, startAngle, endAngle);
    const segmentPath = geom.generateSegmentPath(cx, cy, r, startAngle, endAngle);
    const arcPath = geom.generateArcPath(cx, cy, r, startAngle, endAngle);

    stage.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg" aria-label="Diagram Unsur Lingkaran Interaktif">
        <defs>
          <radialGradient id="uCenterGrad">
            <stop offset="0%" stop-color="#06B6D4"/>
            <stop offset="100%" stop-color="#0284C7"/>
          </radialGradient>
        </defs>

        <!-- Lingkaran Lengkap -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2"/>

        <!-- Juring -->
        <path id="elem-sector" class="unsur-part" d="${sectorPath}" fill="#8B5CF6" fill-opacity="0.2" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="4 4"/>

        <!-- Tembereng -->
        <path id="elem-segment" class="unsur-part" d="${segmentPath}" fill="#06B6D4" fill-opacity="0.2" stroke="none"/>

        <!-- Diameter: garis horizontal penuh -->
        <line id="elem-diameter" class="unsur-part" x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#F59E0B" stroke-width="2.5" opacity="0.6"/>

        <!-- Jari-jari: pusat ke p1 -->
        <line id="elem-radius" class="unsur-part" x1="${cx}" y1="${cy}" x2="${p1.x}" y2="${p1.y}" stroke="#06B6D4" stroke-width="3" stroke-linecap="round"/>

        <!-- Tali Busur -->
        <line id="elem-chord" class="unsur-part" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10B981" stroke-width="2.5"/>

        <!-- Apotema: pusat ke mid tali busur -->
        <line id="elem-apothem" class="unsur-part" x1="${cx}" y1="${cy}" x2="${midX}" y2="${midY}" stroke="#EC4899" stroke-width="2.5" stroke-dasharray="3 3"/>

        <!-- Busur Tebal -->
        <path id="elem-arc" class="unsur-part" d="${arcPath}" fill="none" stroke="#22D3EE" stroke-width="4.5" stroke-linecap="round"/>

        <!-- Titik Pusat O -->
        <circle id="elem-center" class="unsur-part active-focus" cx="${cx}" cy="${cy}" r="6" fill="url(#uCenterGrad)" stroke="#FFFFFF" stroke-width="2"/>
        <text x="${cx - 15}" y="${cy - 10}" fill="currentColor" font-weight="700" font-size="13">O</text>

        <!-- Titik A dan B -->
        <circle cx="${p1.x}" cy="${p1.y}" r="4" fill="#10B981"/>
        <text x="${p1.x + 8}" y="${p1.y}" fill="#10B981" font-weight="700" font-size="12">A</text>
        <circle cx="${p2.x}" cy="${p2.y}" r="4" fill="#10B981"/>
        <text x="${p2.x + 8}" y="${p2.y + 12}" fill="#10B981" font-weight="700" font-size="12">B</text>
      </svg>
    `;

    const unsurData = {
      'elem-center': { name: 'Titik Pusat (O)', desc: 'Titik yang berjarak sama ke semua titik pada keliling lingkaran. Pusat dari koordinat simetri.' },
      'elem-radius': { name: 'Jari-Jari (r)', desc: 'Ruas garis dari titik pusat ke tepi keliling lingkaran. Panjangnya bernilai separuh diameter ($r = \\frac{1}{2}d$).' },
      'elem-diameter': { name: 'Diameter (d)', desc: 'Tali busur terpanjang yang membelah lingkaran melalui titik pusat. Bernilai dua kali jari-jari ($d = 2r$).' },
      'elem-chord': { name: 'Tali Busur', desc: 'Ruas garis lurus yang menghubungkan dua titik sembarang pada busur lingkaran (tanpa harus lewat pusat).' },
      'elem-apothem': { name: 'Apotema', desc: 'Jarak terpendek dari titik pusat tegak lurus ($90^\\circ$) ke tali busur. Membagi tali busur menjadi dua sama panjang.' },
      'elem-arc': { name: 'Busur Lingkaran', desc: 'Garis kurva lengkung yang merupakan bagian dari keliling lingkaran.' },
      'elem-sector': { name: 'Juring (Sektor)', desc: 'Daerah bidang yang dibatasi oleh dua buah jari-jari dan satu busur lingkaran.' },
      'elem-segment': { name: 'Tembereng', desc: 'Daerah bidang yang dibatasi oleh sebuah tali busur dan busurnya.' }
    };

    const updateUnsurHighlight = (targetId) => {
      document.querySelectorAll('.unsur-part').forEach(p => p.classList.remove('active-focus'));
      const activeEl = document.getElementById(targetId);
      if (activeEl) activeEl.classList.add('active-focus');

      const info = unsurData[targetId] || unsurData['elem-center'];
      stats.innerHTML = `
        <div class="stats-item full-width">
          <span class="stats-label">${info.name}</span>
          <span class="stats-value-text">${info.desc}</span>
        </div>
      `;
    };

    controls.querySelectorAll('.elem-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        controls.querySelectorAll('.elem-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-target');
        updateUnsurHighlight(target);
      });
    });

    // Izinkan juga interaksi klik langsung pada elemen diagram SVG
    stage.querySelectorAll('.unsur-part').forEach(part => {
      part.style.cursor = 'pointer';
      part.addEventListener('click', () => {
        const targetId = part.getAttribute('id');
        controls.querySelectorAll('.elem-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-target') === targetId);
        });
        updateUnsurHighlight(targetId);
      });
    });

    updateUnsurHighlight('elem-center');
  };

  /* --- INTERAKTIF BAB 2: KELILING & PANJANG BUSUR --- */
  const initBusurInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-busur-r">Jari-Jari Lingkaran (r):</label>
          <span class="slider-val-badge" id="val-busur-r">14 cm</span>
        </div>
        <input type="range" id="slider-busur-r" min="7" max="35" step="1" value="14" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-busur-angle">Sudut Pusat (α):</label>
          <span class="slider-val-badge" id="val-busur-angle">90°</span>
        </div>
        <input type="range" id="slider-busur-angle" min="15" max="330" step="5" value="90" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 400;
    const svgHeight = 280;
    const cx = 200;
    const cy = 140;

    const render = () => {
      const rVal = parseInt(document.getElementById('slider-busur-r').value, 10);
      const angleVal = parseInt(document.getElementById('slider-busur-angle').value, 10);

      document.getElementById('val-busur-r').textContent = `${rVal} cm`;
      document.getElementById('val-busur-angle').textContent = `${angleVal}°`;

      // Skala visual agar pas di SVG
      const visualR = 40 + (rVal / 35) * 65;
      const startAngle = 0;
      const endAngle = angleVal;

      const p1 = geom.getCirclePoint(cx, cy, visualR, startAngle);
      const p2 = geom.getCirclePoint(cx, cy, visualR, endAngle);
      const arcPath = geom.generateArcPath(cx, cy, visualR, startAngle, endAngle);
      const sectorPath = geom.generateSectorPath(cx, cy, visualR, startAngle, endAngle);

      // Kalkulasi riil
      const keliling = geom.circleCircumference(rVal);
      const arcLen = geom.arcLength(rVal, angleVal);
      const rasio = (angleVal / 360);

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran Dasar -->
          <circle cx="${cx}" cy="${cy}" r="${visualR}" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="2"/>

          <!-- Sektor Bayangan Ringan -->
          <path d="${sectorPath}" fill="#8B5CF6" fill-opacity="0.15" stroke="none"/>

          <!-- Dua Garis Jari-Jari Pembatas -->
          <line x1="${cx}" y1="${cy}" x2="${p1.x}" y2="${p1.y}" stroke="#06B6D4" stroke-width="2.5"/>
          <line x1="${cx}" y1="${cy}" x2="${p2.x}" y2="${p2.y}" stroke="#06B6D4" stroke-width="2.5"/>

          <!-- Busur Berwarna Cyan Terang -->
          <path d="${arcPath}" fill="none" stroke="#22D3EE" stroke-width="5" stroke-linecap="round"/>

          <!-- Indikator Lengkung Sudut Pusat -->
          <path d="${geom.generateArcPath(cx, cy, 25, 0, Math.min(angleVal, 359))}" fill="none" stroke="#F59E0B" stroke-width="2"/>
          <text x="${cx + 30}" y="${cy - 8}" fill="#F59E0B" font-size="11" font-weight="700">${angleVal}°</text>

          <!-- Titik Pusat O -->
          <circle cx="${cx}" cy="${cy}" r="4.5" fill="#8B5CF6"/>
          <text x="${cx - 16}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">O</text>

          <text x="${p1.x + 8}" y="${p1.y + 4}" fill="#06B6D4" font-size="12" font-weight="700">A</text>
          <text x="${p2.x + 6}" y="${p2.y + 6}" fill="#22D3EE" font-size="12" font-weight="700">B</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Keliling Penuh (K)</span>
          <span class="stats-value-num">${geom.formatNumber(keliling)} cm</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Rasio Sudut (α/360°)</span>
          <span class="stats-value-num">${(rasio * 100).toFixed(1)}%</span>
        </div>
        <div class="stats-item highlight-cyan">
          <span class="stats-label">Panjang Busur AB (s)</span>
          <span class="stats-value-num">${geom.formatNumber(arcLen)} cm</span>
        </div>
      `;
    };

    document.getElementById('slider-busur-r').addEventListener('input', render);
    document.getElementById('slider-busur-angle').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 3: LUAS JURING & TEMBERENG --- */
  const initJuringInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-juring-r">Jari-Jari Lingkaran (r):</label>
          <span class="slider-val-badge" id="val-juring-r">14 cm</span>
        </div>
        <input type="range" id="slider-juring-r" min="7" max="28" step="1" value="14" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-juring-angle">Sudut Pusat (α):</label>
          <span class="slider-val-badge" id="val-juring-angle">90°</span>
        </div>
        <input type="range" id="slider-juring-angle" min="30" max="150" step="5" value="90" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 400;
    const svgHeight = 280;
    const cx = 200;
    const cy = 140;

    const render = () => {
      const rVal = parseInt(document.getElementById('slider-juring-r').value, 10);
      const angleVal = parseInt(document.getElementById('slider-juring-angle').value, 10);

      document.getElementById('val-juring-r').textContent = `${rVal} cm`;
      document.getElementById('val-juring-angle').textContent = `${angleVal}°`;

      const visualR = 50 + (rVal / 28) * 55;
      const startAngle = 0;
      const endAngle = angleVal;

      const p1 = geom.getCirclePoint(cx, cy, visualR, startAngle);
      const p2 = geom.getCirclePoint(cx, cy, visualR, endAngle);
      const sectorPath = geom.generateSectorPath(cx, cy, visualR, startAngle, endAngle);
      const segmentPath = geom.generateSegmentPath(cx, cy, visualR, startAngle, endAngle);

      // Kalkulasi matematis
      const luasTotal = geom.circleArea(rVal);
      const luasJuring = geom.sectorArea(rVal, angleVal);
      const luasTembereng = geom.segmentArea(rVal, angleVal);
      const luasSegitiga = Math.max(0, luasJuring - luasTembereng);

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran Lengkap -->
          <circle cx="${cx}" cy="${cy}" r="${visualR}" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="2"/>

          <!-- Juring (Ungu Elektrik) -->
          <path d="${sectorPath}" fill="#8B5CF6" fill-opacity="0.3" stroke="#8B5CF6" stroke-width="1.5"/>

          <!-- Segitiga AOB (Dasar) -->
          <polygon points="${cx},${cy} ${p1.x},${p1.y} ${p2.x},${p2.y}" fill="#1E293B" fill-opacity="0.5" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3 3"/>

          <!-- Tembereng (Cyan Aksen) -->
          <path d="${segmentPath}" fill="#06B6D4" fill-opacity="0.65" stroke="#22D3EE" stroke-width="2"/>

          <!-- Tali Busur AB -->
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#F59E0B" stroke-width="2.5"/>

          <!-- Titik Pusat O -->
          <circle cx="${cx}" cy="${cy}" r="4.5" fill="#8B5CF6"/>
          <text x="${cx - 15}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">O</text>
          <text x="${p1.x + 8}" y="${p1.y + 4}" fill="#06B6D4" font-size="12" font-weight="700">A</text>
          <text x="${p2.x + 6}" y="${p2.y + 8}" fill="#06B6D4" font-size="12" font-weight="700">B</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Luas Lingkaran (πr²)</span>
          <span class="stats-value-num">${geom.formatNumber(luasTotal)} cm²</span>
        </div>
        <div class="stats-item highlight-purple">
          <span class="stats-label">Luas Juring (Ungu)</span>
          <span class="stats-value-num">${geom.formatNumber(luasJuring)} cm²</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Luas Segitiga AOB</span>
          <span class="stats-value-num">${geom.formatNumber(luasSegitiga)} cm²</span>
        </div>
        <div class="stats-item highlight-cyan">
          <span class="stats-label">Luas Tembereng (Cyan)</span>
          <span class="stats-value-num">${geom.formatNumber(luasTembereng)} cm²</span>
        </div>
      `;
    };

    document.getElementById('slider-juring-r').addEventListener('input', render);
    document.getElementById('slider-juring-angle').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 4: SUDUT PUSAT & SUDUT KELILING --- */
  const initSudutInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-sudut-center">Sudut Pusat (∠AOB):</label>
          <span class="slider-val-badge" id="val-sudut-center">100°</span>
        </div>
        <input type="range" id="slider-sudut-center" min="30" max="170" step="2" value="100" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 400;
    const svgHeight = 280;
    const cx = 200;
    const cy = 140;
    const r = 95;

    const render = () => {
      const centralAngle = parseInt(document.getElementById('slider-sudut-center').value, 10);
      const inscribedAngle = centralAngle / 2;

      document.getElementById('val-sudut-center').textContent = `${centralAngle}°`;

      // Titik A dan B di busur bawah simetris
      const halfAngle = centralAngle / 2;
      const angleA = 90 - halfAngle;
      const angleB = 90 + halfAngle;

      const ptA = geom.getCirclePoint(cx, cy, r, angleA);
      const ptB = geom.getCirclePoint(cx, cy, r, angleB);

      // Titik C di puncak atas lingkaran (-90°)
      const ptC = geom.getCirclePoint(cx, cy, r, -90);

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran -->
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2"/>

          <!-- Busur AB diarsir tebal -->
          <path d="${geom.generateArcPath(cx, cy, r, angleA, angleB)}" fill="none" stroke="#EC4899" stroke-width="4.5" stroke-linecap="round"/>

          <!-- Sudut Pusat: OA dan OB (Oranye) -->
          <line x1="${cx}" y1="${cy}" x2="${ptA.x}" y2="${ptA.y}" stroke="#F59E0B" stroke-width="2.5"/>
          <line x1="${cx}" y1="${cy}" x2="${ptB.x}" y2="${ptB.y}" stroke="#F59E0B" stroke-width="2.5"/>

          <!-- Sudut Keliling: CA dan CB (Cyan) -->
          <line x1="${ptC.x}" y1="${ptC.y}" x2="${ptA.x}" y2="${ptA.y}" stroke="#06B6D4" stroke-width="2" stroke-dasharray="4 2"/>
          <line x1="${ptC.x}" y1="${ptC.y}" x2="${ptB.x}" y2="${ptB.y}" stroke="#06B6D4" stroke-width="2" stroke-dasharray="4 2"/>

          <!-- Titik-titik Sudut -->
          <circle cx="${cx}" cy="${cy}" r="5" fill="#F59E0B"/>
          <text x="${cx - 15}" y="${cy - 8}" fill="#F59E0B" font-size="12" font-weight="700">O</text>

          <circle cx="${ptC.x}" cy="${ptC.y}" r="5" fill="#06B6D4"/>
          <text x="${ptC.x - 4}" y="${ptC.y - 10}" fill="#06B6D4" font-size="12" font-weight="700">C</text>

          <circle cx="${ptA.x}" cy="${ptA.y}" r="4" fill="#EC4899"/>
          <text x="${ptA.x + 6}" y="${ptA.y + 12}" fill="#EC4899" font-size="12" font-weight="700">A</text>

          <circle cx="${ptB.x}" cy="${ptB.y}" r="4" fill="#EC4899"/>
          <text x="${ptB.x - 14}" y="${ptB.y + 12}" fill="#EC4899" font-size="12" font-weight="700">B</text>

          <!-- Label Sudut -->
          <text x="${cx - 12}" y="${cy + 22}" fill="#F59E0B" font-size="12" font-weight="800">${centralAngle}°</text>
          <text x="${ptC.x - 10}" y="${ptC.y + 24}" fill="#06B6D4" font-size="12" font-weight="800">${inscribedAngle}°</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item highlight-amber">
          <span class="stats-label">Sudut Pusat ∠AOB</span>
          <span class="stats-value-num">${centralAngle}°</span>
        </div>
        <div class="stats-item highlight-cyan">
          <span class="stats-label">Sudut Keliling ∠ACB</span>
          <span class="stats-value-num">${inscribedAngle}°</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Relasi Matematika</span>
          <span class="stats-value-text">∠Pusat = 2 × ∠Keliling</span>
        </div>
      `;
    };

    document.getElementById('slider-sudut-center').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 5: GARIS SINGGUNG LINGKARAN --- */
  const initSinggungInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gs-p">Jarak Titik P ke Pusat (p):</label>
          <span class="slider-val-badge" id="val-gs-p">25 cm</span>
        </div>
        <input type="range" id="slider-gs-p" min="15" max="35" step="1" value="25" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gs-r">Jari-Jari Lingkaran (r):</label>
          <span class="slider-val-badge" id="val-gs-r">7 cm</span>
        </div>
        <input type="range" id="slider-gs-r" min="5" max="12" step="1" value="7" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 420;
    const svgHeight = 280;
    const cx = 110;
    const cy = 140;

    const render = () => {
      const pVal = parseInt(document.getElementById('slider-gs-p').value, 10);
      const rVal = parseInt(document.getElementById('slider-gs-r').value, 10);

      document.getElementById('val-gs-p').textContent = `${pVal} cm`;
      document.getElementById('val-gs-r').textContent = `${rVal} cm`;

      // Skala representasi
      const scale = 7;
      const visualR = rVal * scale;
      const visualP = pVal * scale;
      const px = cx + visualP;
      const py = cy;

      const tangData = geom.calculateTangentPoints(cx, cy, visualR, px, py);
      const dRiil = geom.tangentLengthFromPoint(pVal, rVal);

      if (!tangData || dRiil === null) {
        stage.innerHTML = '<p class="error-msg">Jarak titik luar harus lebih besar dari jari-jari (p > r).</p>';
        return;
      }

      const t1 = tangData.t1;
      const t2 = tangData.t2;

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran -->
          <circle cx="${cx}" cy="${cy}" r="${visualR}" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2"/>

          <!-- Garis Pusat ke Titik Luar (OP) -->
          <line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="#64748B" stroke-dasharray="3 3" stroke-width="2"/>

          <!-- Garis Singgung 1 (PT1) & Jari-jari (OT1) -->
          <line x1="${px}" y1="${py}" x2="${t1.x}" y2="${t1.y}" stroke="#EC4899" stroke-width="3" stroke-linecap="round"/>
          <line x1="${cx}" y1="${cy}" x2="${t1.x}" y2="${t1.y}" stroke="#06B6D4" stroke-width="2.5"/>

          <!-- Garis Singgung 2 (PT2) -->
          <line x1="${px}" y1="${py}" x2="${t2.x}" y2="${t2.y}" stroke="#EC4899" stroke-width="1.8" stroke-dasharray="2 2"/>

          <!-- Titik Pusat O, Luar P, Singgung T -->
          <circle cx="${cx}" cy="${cy}" r="5" fill="#8B5CF6"/>
          <text x="${cx - 15}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">O</text>

          <circle cx="${px}" cy="${py}" r="5" fill="#F59E0B"/>
          <text x="${px + 8}" y="${py + 4}" fill="#F59E0B" font-size="12" font-weight="700">P</text>

          <circle cx="${t1.x}" cy="${t1.y}" r="4.5" fill="#EC4899"/>
          <text x="${t1.x - 5}" y="${t1.y - 8}" fill="#EC4899" font-size="12" font-weight="700">T</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Jarak OP (p)</span>
          <span class="stats-value-num">${pVal} cm</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Jari-Jari (r)</span>
          <span class="stats-value-num">${rVal} cm</span>
        </div>
        <div class="stats-item highlight-pink">
          <span class="stats-label">Panjang Garis Singgung (d)</span>
          <span class="stats-value-num">${geom.formatNumber(dRiil)} cm</span>
        </div>
      `;
    };

    document.getElementById('slider-gs-p').addEventListener('input', render);
    document.getElementById('slider-gs-r').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 6: GSPL --- */
  const initGSPLInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspl-p">Jarak Antarpusat (p):</label>
          <span class="slider-val-badge" id="val-gspl-p">26 cm</span>
        </div>
        <input type="range" id="slider-gspl-p" min="16" max="38" step="1" value="26" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspl-R">Jari-Jari Besar (R):</label>
          <span class="slider-val-badge" id="val-gspl-R">14 cm</span>
        </div>
        <input type="range" id="slider-gspl-R" min="8" max="18" step="1" value="14" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspl-r">Jari-Jari Kecil (r):</label>
          <span class="slider-val-badge" id="val-gspl-r">4 cm</span>
        </div>
        <input type="range" id="slider-gspl-r" min="2" max="7" step="1" value="4" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 440;
    const svgHeight = 280;
    const cy = 140;

    const render = () => {
      const pVal = parseInt(document.getElementById('slider-gspl-p').value, 10);
      const RVal = parseInt(document.getElementById('slider-gspl-R').value, 10);
      const rVal = parseInt(document.getElementById('slider-gspl-r').value, 10);

      document.getElementById('val-gspl-p').textContent = `${pVal} cm`;
      document.getElementById('val-gspl-R').textContent = `${RVal} cm`;
      document.getElementById('val-gspl-r').textContent = `${rVal} cm`;

      const diff = RVal - rVal;
      const gsplVal = geom.gsplLength(pVal, RVal, rVal);

      // Koordinat visual skala
      const scale = 7;
      const visualDist = pVal * scale;
      const cx1 = 90;
      const cx2 = cx1 + visualDist;
      const visualR = RVal * scale;
      const visualr = rVal * scale;

      const gsplGeom = geom.calculateGSPLGeometry(cx1, cy, visualR, cx2, cy, visualr);

      if (gsplVal === null || !gsplGeom) {
        stage.innerHTML = `
          <div class="diagram-note-box">
            <p style="font-weight: 700; color: #F59E0B; margin-bottom: 4px;">⚠️ Perhatian Geometri</p>
            <p>Jarak antar pusat (p = ${pVal} cm) harus lebih besar dari selisih jari-jari (R - r = ${diff} cm).</p>
          </div>
        `;
        stats.innerHTML = `
          <div class="stats-item full-width highlight-amber">
            <span class="stats-label">Status Geometri</span>
            <span class="stats-value-text">Lingkaran kecil konsentris atau di dalam lingkaran besar. Silakan perbesar jarak p.</span>
          </div>
        `;
        return;
      }

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran 1 (Besar) -->
          <circle cx="${cx1}" cy="${cy}" r="${visualR}" fill="none" stroke="#8B5CF6" stroke-width="2"/>
          <circle cx="${cx1}" cy="${cy}" r="4" fill="#8B5CF6"/>
          <text x="${cx1 - 18}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">P₁</text>

          <!-- Lingkaran 2 (Kecil) -->
          <circle cx="${cx2}" cy="${cy}" r="${visualr}" fill="none" stroke="#06B6D4" stroke-width="2"/>
          <circle cx="${cx2}" cy="${cy}" r="4" fill="#06B6D4"/>
          <text x="${cx2 + 8}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">P₂</text>

          <!-- Garis Penghubung Pusat -->
          <line x1="${cx1}" y1="${cy}" x2="${cx2}" y2="${cy}" stroke="#64748B" stroke-dasharray="3 3" stroke-width="1.8"/>

          <!-- Garis Singgung Persekutuan Luar (GSPL) Atas -->
          <line x1="${gsplGeom.top.p1.x}" y1="${gsplGeom.top.p1.y}" x2="${gsplGeom.top.p2.x}" y2="${gsplGeom.top.p2.y}" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>

          <!-- Titik-Titik Singgung -->
          <circle cx="${gsplGeom.top.p1.x}" cy="${gsplGeom.top.p1.y}" r="4" fill="#10B981"/>
          <circle cx="${gsplGeom.top.p2.x}" cy="${gsplGeom.top.p2.y}" r="4" fill="#10B981"/>

          <!-- Label Garis -->
          <text x="${(cx1 + cx2) / 2 - 15}" y="${gsplGeom.top.p1.y - 10}" fill="#10B981" font-size="12" font-weight="800">GSPL</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Jarak Pusat (p)</span>
          <span class="stats-value-num">${pVal} cm</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Selisih (R - r)</span>
          <span class="stats-value-num">${diff} cm</span>
        </div>
        <div class="stats-item highlight-green">
          <span class="stats-label">Panjang GSPL (d)</span>
          <span class="stats-value-num">${geom.formatNumber(gsplVal)} cm</span>
        </div>
      `;
    };

    document.getElementById('slider-gspl-p').addEventListener('input', render);
    document.getElementById('slider-gspl-R').addEventListener('input', render);
    document.getElementById('slider-gspl-r').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 7: GSPD --- */
  const initGSPDInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspd-p">Jarak Antarpusat (p):</label>
          <span class="slider-val-badge" id="val-gspd-p">20 cm</span>
        </div>
        <input type="range" id="slider-gspd-p" min="15" max="35" step="1" value="20" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspd-R">Jari-Jari Besar (R):</label>
          <span class="slider-val-badge" id="val-gspd-R">7 cm</span>
        </div>
        <input type="range" id="slider-gspd-R" min="5" max="12" step="1" value="7" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-gspd-r">Jari-Jari Kecil (r):</label>
          <span class="slider-val-badge" id="val-gspd-r">3 cm</span>
        </div>
        <input type="range" id="slider-gspd-r" min="2" max="6" step="1" value="3" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 440;
    const svgHeight = 280;
    const cy = 140;

    const render = () => {
      const pVal = parseInt(document.getElementById('slider-gspd-p').value, 10);
      const RVal = parseInt(document.getElementById('slider-gspd-R').value, 10);
      const rVal = parseInt(document.getElementById('slider-gspd-r').value, 10);

      document.getElementById('val-gspd-p').textContent = `${pVal} cm`;
      document.getElementById('val-gspd-R').textContent = `${RVal} cm`;
      document.getElementById('val-gspd-r').textContent = `${rVal} cm`;

      const sum = RVal + rVal;
      const gspdVal = geom.gspdLength(pVal, RVal, rVal);

      const scale = 8;
      const visualDist = pVal * scale;
      const cx1 = 90;
      const cx2 = cx1 + visualDist;
      const visualR = RVal * scale;
      const visualr = rVal * scale;

      const gspdGeom = geom.calculateGSPDGeometry(cx1, cy, visualR, cx2, cy, visualr);

      if (gspdVal === null || !gspdGeom) {
        stage.innerHTML = `
          <div class="diagram-note-box">
            <p style="font-weight: 700; color: #F59E0B; margin-bottom: 4px;">⚠️ Perhatian Geometri</p>
            <p>Jarak antar pusat (p = ${pVal} cm) harus lebih besar dari jumlah kedua jari-jari (R + r = ${sum} cm) agar kedua lingkaran terpisah dan garis singgung dalam dapat terbentuk.</p>
          </div>
        `;
        stats.innerHTML = `
          <div class="stats-item full-width highlight-amber">
            <span class="stats-label">Status Geometri</span>
            <span class="stats-value-text">Kedua lingkaran saling bersinggungan atau berpotongan (p ≤ R + r). Silakan geser slider p lebih besar atau perkecil jari-jari R dan r.</span>
          </div>
        `;
        return;
      }

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Lingkaran 1 -->
          <circle cx="${cx1}" cy="${cy}" r="${visualR}" fill="none" stroke="#8B5CF6" stroke-width="2"/>
          <circle cx="${cx1}" cy="${cy}" r="4" fill="#8B5CF6"/>
          <text x="${cx1 - 18}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">P₁</text>

          <!-- Lingkaran 2 -->
          <circle cx="${cx2}" cy="${cy}" r="${visualr}" fill="none" stroke="#06B6D4" stroke-width="2"/>
          <circle cx="${cx2}" cy="${cy}" r="4" fill="#06B6D4"/>
          <text x="${cx2 + 8}" y="${cy + 5}" fill="currentColor" font-size="12" font-weight="700">P₂</text>

          <!-- Garis Pusat -->
          <line x1="${cx1}" y1="${cy}" x2="${cx2}" y2="${cy}" stroke="#64748B" stroke-dasharray="3 3" stroke-width="1.8"/>

          <!-- Garis Singgung Persekutuan Dalam Menyilang -->
          <line x1="${gspdGeom.line1.p1.x}" y1="${gspdGeom.line1.p1.y}" x2="${gspdGeom.line1.p2.x}" y2="${gspdGeom.line1.p2.y}" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>

          <circle cx="${gspdGeom.line1.p1.x}" cy="${gspdGeom.line1.p1.y}" r="4" fill="#F59E0B"/>
          <circle cx="${gspdGeom.line1.p2.x}" cy="${gspdGeom.line1.p2.y}" r="4" fill="#F59E0B"/>

          <text x="${(cx1 + cx2) / 2 - 12}" y="${cy - 8}" fill="#F59E0B" font-size="12" font-weight="800">GSPD</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Jarak Pusat (p)</span>
          <span class="stats-value-num">${pVal} cm</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Jumlah (R + r)</span>
          <span class="stats-value-num">${sum} cm</span>
        </div>
        <div class="stats-item highlight-amber">
          <span class="stats-label">Panjang GSPD (d)</span>
          <span class="stats-value-num">${geom.formatNumber(gspdVal)} cm</span>
        </div>
      `;
    };

    document.getElementById('slider-gspd-p').addEventListener('input', render);
    document.getElementById('slider-gspd-R').addEventListener('input', render);
    document.getElementById('slider-gspd-r').addEventListener('input', render);
    render();
  };

  /* --- INTERAKTIF BAB 8: APLIKASI RANTAI & GABUNGAN --- */
  const initAplikasiInteractive = (stage, controls, stats, geom) => {
    controls.innerHTML = `
      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-app-p">Jarak Poros Roda (p):</label>
          <span class="slider-val-badge" id="val-app-p">30 cm</span>
        </div>
        <input type="range" id="slider-app-p" min="20" max="40" step="1" value="30" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-app-R">Jari-Jari Roda Besar (R):</label>
          <span class="slider-val-badge" id="val-app-R">14 cm</span>
        </div>
        <input type="range" id="slider-app-R" min="8" max="18" step="1" value="14" class="custom-range-slider">
      </div>

      <div class="slider-control-row">
        <div class="slider-header-info">
          <label for="slider-app-r">Jari-Jari Roda Kecil (r):</label>
          <span class="slider-val-badge" id="val-app-r">4 cm</span>
        </div>
        <input type="range" id="slider-app-r" min="2" max="6" step="1" value="4" class="custom-range-slider">
      </div>
    `;

    const svgWidth = 440;
    const svgHeight = 280;
    const cy = 140;

    const render = () => {
      const pVal = parseInt(document.getElementById('slider-app-p').value, 10);
      const RVal = parseInt(document.getElementById('slider-app-R').value, 10);
      const rVal = parseInt(document.getElementById('slider-app-r').value, 10);

      document.getElementById('val-app-p').textContent = `${pVal} cm`;
      document.getElementById('val-app-R').textContent = `${RVal} cm`;
      document.getElementById('val-app-r').textContent = `${rVal} cm`;

      const diff = RVal - rVal;
      const dStraight = geom.gsplLength(pVal, RVal, rVal);

      const scale = 7;
      const visualDist = pVal * scale;
      const cx1 = 90;
      const cx2 = cx1 + visualDist;
      const visualR = RVal * scale;
      const visualr = rVal * scale;

      const gspl = geom.calculateGSPLGeometry(cx1, cy, visualR, cx2, cy, visualr);

      if (dStraight === null || !gspl) {
        stage.innerHTML = `
          <div class="diagram-note-box">
            <p style="font-weight: 700; color: #F59E0B; margin-bottom: 4px;">⚠️ Perhatian Geometri</p>
            <p>Jarak poros roda (p = ${pVal} cm) harus lebih besar dari selisih jari-jari roda (R - r = ${diff} cm).</p>
          </div>
        `;
        stats.innerHTML = `
          <div class="stats-item full-width highlight-amber">
            <span class="stats-label">Status Geometri</span>
            <span class="stats-value-text">Sistem sabuk tidak dapat dipasang jika roda bertumpuk. Silakan perbesar jarak poros p.</span>
          </div>
        `;
        return;
      }

      const totalStraight = 2 * dStraight;

      stage.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="interactive-live-svg">
          <!-- Sabuk Rentang Atas -->
          <line x1="${gspl.top.p1.x}" y1="${gspl.top.p1.y}" x2="${gspl.top.p2.x}" y2="${gspl.top.p2.y}" stroke="#22D3EE" stroke-width="3" stroke-linecap="round"/>

          <!-- Sabuk Rentang Bawah -->
          <line x1="${gspl.bottom.p1.x}" y1="${gspl.bottom.p1.y}" x2="${gspl.bottom.p2.x}" y2="${gspl.bottom.p2.y}" stroke="#22D3EE" stroke-width="3" stroke-linecap="round"/>

          <!-- Roda Besar -->
          <circle cx="${cx1}" cy="${cy}" r="${visualR}" fill="#151E34" stroke="#8B5CF6" stroke-width="3"/>
          <circle cx="${cx1}" cy="${cy}" r="6" fill="#8B5CF6"/>

          <!-- Roda Kecil -->
          <circle cx="${cx2}" cy="${cy}" r="${visualr}" fill="#151E34" stroke="#06B6D4" stroke-width="3"/>
          <circle cx="${cx2}" cy="${cy}" r="5" fill="#06B6D4"/>

          <!-- Sumbu Garis Pusat -->
          <line x1="${cx1}" y1="${cy}" x2="${cx2}" y2="${cy}" stroke="#64748B" stroke-dasharray="2 2" stroke-width="1.5"/>

          <text x="${(cx1 + cx2) / 2 - 25}" y="${gspl.top.p1.y - 8}" fill="#22D3EE" font-size="11" font-weight="700">Rentang Atas (d)</text>
          <text x="${(cx1 + cx2) / 2 - 25}" y="${gspl.bottom.p1.y + 16}" fill="#22D3EE" font-size="11" font-weight="700">Rentang Bawah (d)</text>
        </svg>
      `;

      stats.innerHTML = `
        <div class="stats-item">
          <span class="stats-label">Rentang Lurus Bebas (1 sisi)</span>
          <span class="stats-value-num">${geom.formatNumber(dStraight)} cm</span>
        </div>
        <div class="stats-item highlight-cyan">
          <span class="stats-label">Total Dua Rentang Lurus (2d)</span>
          <span class="stats-value-num">${geom.formatNumber(totalStraight)} cm</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">Model Matematika</span>
          <span class="stats-value-text">Sistem Sabuk Terbuka (GSPL)</span>
        </div>
      `;
    };

    document.getElementById('slider-app-p').addEventListener('input', render);
    document.getElementById('slider-app-R').addEventListener('input', render);
    document.getElementById('slider-app-r').addEventListener('input', render);
    render();
  };

  /* ==========================================================================
     9. INISIALISASI AWAL HALAMAN MATERI
     ========================================================================== */
  const initialBab = getCurrentChapterFromUrl();
  renderSidebar();
  renderChapterContent(initialBab);
  updateProgressDisplay();

  // Dengarkan event popstate (tombol back/forward browser)
  window.addEventListener('popstate', () => {
    const bab = getCurrentChapterFromUrl();
    updateSidebarItems();
    renderChapterContent(bab);
  });
});
