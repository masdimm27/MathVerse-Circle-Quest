/**
 * MathVerse — Circle Quest
 * js/questions.js
 * 
 * Bank data soal & tantangan matematika geometri lingkaran tingkat SMA (Fase F).
 * Digunakan sebagai fondasi mesin kuis dan tantangan interaktif.
 */

const MathVerseQuestions = (() => {
  'use strict';

  // Bank Soal Terstruktur untuk 8 Topik Geometri Lingkaran
  const questionBank = [
    // Topik 1: Unsur-unsur Lingkaran
    {
      id: 'unsur-01',
      topicId: 'unsur_lingkaran',
      topicTitle: 'Unsur-unsur Lingkaran',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      question: 'Daerah di dalam lingkaran yang dibatasi oleh sebuah busur lingkaran dan dua jari-jari yang menghubungkan ujung busur ke pusat lingkaran disebut ...',
      options: [
        'Tembereng',
        'Juring (Sektor)',
        'Apotema',
        'Tali Busur'
      ],
      correctAnswer: 1,
      formulaReference: 'Definisi Geometri Dasar',
      hint: 'Bayangkan sepotong potongan pizza yang berpusat pada titik tengah lingkaran.',
      explanation: 'Juring (sektor) adalah daerah yang dibatasi oleh dua jari-jari dan satu busur lingkaran. Sedangkan tembereng adalah daerah yang dibatasi oleh tali busur dan busurnya.'
    },
    {
      id: 'unsur-02',
      topicId: 'unsur_lingkaran',
      topicTitle: 'Unsur-unsur Lingkaran',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Garis terpendek yang ditarik dari titik pusat lingkaran tegak lurus ke suatu tali busur dinamakan ...',
      options: [
        'Diameter',
        'Busur minor',
        'Apotema',
        'Garis pelukis'
      ],
      correctAnswer: 2,
      formulaReference: 'Apotema ⊥ Tali Busur',
      hint: 'Garis ini membagi tali busur menjadi dua bagian yang sama panjang dan selalu tegak lurus (90°).',
      explanation: 'Apotema adalah ruas garis yang menghubungkan titik pusat lingkaran secara tegak lurus dengan sebuah tali busur.'
    },

    // Topik 2: Keliling dan Panjang Busur
    {
      id: 'busur-01',
      topicId: 'keliling_busur',
      topicTitle: 'Keliling & Panjang Busur',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      question: 'Sebuah lingkaran memiliki jari-jari r = 14 cm. Dengan menggunakan π = 22/7, berapakah keliling lingkaran tersebut?',
      options: [
        '44 cm',
        '88 cm',
        '176 cm',
        '616 cm'
      ],
      correctAnswer: 1,
      formulaReference: 'K = 2 · π · r',
      hint: 'Gunakan perkalian 2 × (22/7) × 14.',
      explanation: 'K = 2 × π × r = 2 × (22/7) × 14 = 2 × 22 × 2 = 88 cm.'
    },
    {
      id: 'busur-02',
      topicId: 'keliling_busur',
      topicTitle: 'Keliling & Panjang Busur',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Diketahui sudut pusat lingkaran ∠AOB = 90° dan jari-jari r = 28 cm (π = 22/7). Berapakah panjang busur AB?',
      options: [
        '22 cm',
        '44 cm',
        '88 cm',
        '176 cm'
      ],
      correctAnswer: 1,
      formulaReference: 's = (α / 360°) × 2πr',
      hint: '90° merupakan seperempat (1/4) dari keliling penuh lingkaran.',
      explanation: 'Keliling lingkaran K = 2 × (22/7) × 28 = 176 cm. Panjang busur AB = (90°/360°) × 176 = 1/4 × 176 = 44 cm.'
    },

    // Topik 3: Luas Juring dan Tembereng
    {
      id: 'juring-01',
      topicId: 'luas_juring_tembereng',
      topicTitle: 'Luas Juring & Tembereng',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Suatu juring memiliki sudut pusat 60° pada lingkaran berjari-jari 21 cm (π = 22/7). Luas juring tersebut adalah ...',
      options: [
        '231 cm²',
        '462 cm²',
        '693 cm²',
        '1.386 cm²'
      ],
      correctAnswer: 0,
      formulaReference: 'L_juring = (α / 360°) × πr²',
      hint: '60° / 360° = 1/6 dari luas keseluruhan lingkaran.',
      explanation: 'Luas lingkaran penuh = (22/7) × 21 × 21 = 22 × 3 × 21 = 1.386 cm². Luas juring = 1/6 × 1.386 = 231 cm².'
    },
    {
      id: 'juring-02',
      topicId: 'luas_juring_tembereng',
      topicTitle: 'Luas Juring & Tembereng',
      difficulty: 'sulit',
      difficultyLabel: 'Lanjutan',
      question: 'Pada lingkaran berpusat O dengan jari-jari 10 cm, terdapat sudut siku-siku ∠AOB = 90°. Luas tembereng AB adalah ... (Gunakan π = 3,14)',
      options: [
        '28,5 cm²',
        '50 cm²',
        '78,5 cm²',
        '114 cm²'
      ],
      correctAnswer: 0,
      formulaReference: 'L_tembereng = L_juring - L_segitiga',
      hint: 'L_juring = 1/4 × πr², dan L_segitiga = 1/2 × r × r.',
      explanation: 'L_juring = (90/360) × 3,14 × 10² = 0,25 × 314 = 78,5 cm². L_segitiga AOB = 1/2 × 10 × 10 = 50 cm². Luas tembereng = 78,5 - 50 = 28,5 cm².'
    },

    // Topik 4: Sudut Pusat dan Sudut Keliling
    {
      id: 'sudut-01',
      topicId: 'sudut_pusat_keliling',
      topicTitle: 'Sudut Pusat & Sudut Keliling',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      question: 'Jika sudut keliling ∠ACB yang menghadap busur AB bernilai 35°, berapakah besar sudut pusat ∠AOB yang menghadap busur yang sama?',
      options: [
        '17,5°',
        '35°',
        '70°',
        '140°'
      ],
      correctAnswer: 2,
      formulaReference: 'Sudut Pusat = 2 × Sudut Keliling',
      hint: 'Sudut pusat selalu 2 kali lipat dari sudut keliling yang menghadap busur yang sama.',
      explanation: 'Besar sudut pusat = 2 × sudut keliling = 2 × 35° = 70°.'
    },
    {
      id: 'sudut-02',
      topicId: 'sudut_pusat_keliling',
      topicTitle: 'Sudut Pusat & Sudut Keliling',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Sebuah sudut keliling menghadap ke tali busur yang merupakan diameter lingkaran. Berapakah besar sudut keliling tersebut?',
      options: [
        '45°',
        '60°',
        '90° (Siku-siku)',
        '180°'
      ],
      correctAnswer: 2,
      formulaReference: 'Teorema Thales: ∠ = 1/2 × 180°',
      hint: 'Sudut pusat yang dibentuk oleh diameter adalah garis lurus (180°).',
      explanation: 'Karena diameter membentuk sudut pusat 180°, maka setiap sudut keliling yang menghadap diameter besarnya 1/2 × 180° = 90° (siku-siku).'
    },

    // Topik 5: Garis Singgung Lingkaran
    {
      id: 'gs-01',
      topicId: 'garis_singgung',
      topicTitle: 'Garis Singgung Lingkaran',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Sebuah titik P berada di luar lingkaran yang berpusat di O dengan jari-jari r = 5 cm. Jarak titik P ke pusat O adalah 13 cm. Panjang ruas garis singgung dari P ke lingkaran adalah ...',
      options: [
        '8 cm',
        '12 cm',
        '14 cm',
        '18 cm'
      ],
      correctAnswer: 1,
      formulaReference: 'Teorema Pythagoras: d = √(OP² - r²)',
      hint: 'Jari-jari di titik singgung membentuk segitiga siku-siku dengan hipotenusa OP.',
      explanation: 'Garis singgung tegak lurus jari-jari. d = √(13² - 5²) = √(169 - 25) = √144 = 12 cm.'
    },

    // Topik 6: Garis Singgung Persekutuan Luar (GSPL)
    {
      id: 'gspl-01',
      topicId: 'gspl',
      topicTitle: 'Garis Singgung Persekutuan Luar',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      question: 'Dua lingkaran memiliki jari-jari R = 11 cm dan r = 3 cm. Jarak antara kedua titik pusat adalah 17 cm. Panjang garis singgung persekutuan luar (GSPL) adalah ...',
      options: [
        '12 cm',
        '15 cm',
        '16 cm',
        '20 cm'
      ],
      correctAnswer: 1,
      formulaReference: 'd = √(p² - (R - r)²)',
      hint: 'Hitung selisih jari-jari: R - r = 11 - 3 = 8 cm. Lalu gunakan Pythagoras dengan jarak pusat 17 cm.',
      explanation: 'd = √(17² - (11 - 3)²) = √(289 - 8²) = √(289 - 64) = √225 = 15 cm.'
    },

    // Topik 7: Garis Singgung Persekutuan Dalam (GSPD)
    {
      id: 'gspd-01',
      topicId: 'gspd',
      topicTitle: 'Garis Singgung Persekutuan Dalam',
      difficulty: 'sulit',
      difficultyLabel: 'Lanjutan',
      question: 'Dua lingkaran memiliki jari-jari R = 7 cm dan r = 3 cm. Jarak antara kedua pusat lingkaran adalah 26 cm. Panjang garis singgung persekutuan dalam (GSPD) adalah ...',
      options: [
        '20 cm',
        '22 cm',
        '24 cm',
        '25 cm'
      ],
      correctAnswer: 2,
      formulaReference: 'd = √(p² - (R + r)²)',
      hint: 'Pada GSPD, jari-jari dijumlahkan: R + r = 7 + 3 = 10 cm.',
      explanation: 'd = √(26² - (7 + 3)²) = √(676 - 10²) = √(676 - 100) = √576 = 24 cm.'
    },

    // Topik 8: Soal Aplikasi dan Latihan Campuran
    {
      id: 'app-01',
      topicId: 'aplikasi_campuran',
      topicTitle: 'Aplikasi & Latihan Campuran',
      difficulty: 'sulit',
      difficultyLabel: 'Tantangan Master',
      question: 'Dua buah roda gigi sepeda masing-masing berjari-jari 14 cm dan 4 cm dihubungkan dengan rantai terbuka melingkar (GSPL). Jika jarak pusat kedua poros roda gigi adalah 26 cm, panjang rentang rantai bebas yang lurus antara kedua roda adalah ...',
      options: [
        '20 cm',
        '24 cm',
        '25 cm',
        '28 cm'
      ],
      correctAnswer: 1,
      formulaReference: 'Aplikasi GSPL: d = √(p² - (R - r)²)',
      hint: 'Bagian rantai yang lurus membentang persis sama dengan panjang garis singgung persekutuan luar (GSPL).',
      explanation: 'Rentang rantai bebas sama dengan panjang GSPL: d = √(26² - (14 - 4)²) = √(676 - 100) = √576 = 24 cm.'
    },

    // --- SOAL ISIAN NUMERIK & TAMBAHAN ---
    {
      id: 'unsur-03',
      topicId: 'unsur_lingkaran',
      topicTitle: 'Unsur-unsur Lingkaran',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      type: 'choice',
      question: 'Sebuah lingkaran memiliki diameter 28 cm. Berapakah panjang jari-jari lingkaran tersebut?',
      options: [
        '7 cm',
        '14 cm',
        '28 cm',
        '56 cm'
      ],
      correctAnswer: 1,
      formulaReference: 'r = 1/2 · d',
      hint: 'Jari-jari bernilai tepat separuh dari panjang diameter.',
      explanation: 'r = d / 2 = 28 / 2 = 14 cm.'
    },
    {
      id: 'busur-num-01',
      topicId: 'keliling_busur',
      topicTitle: 'Keliling & Panjang Busur',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      type: 'numeric',
      question: 'Sebuah lingkaran berjari-jari r = 7 cm (gunakan π = 22/7). Berapakah keliling lingkaran tersebut?',
      correctNumeric: 44,
      unit: 'cm',
      tolerance: 0.2,
      formulaReference: 'K = 2 · π · r',
      hint: 'K = 2 × (22/7) × 7.',
      explanation: 'K = 2 × (22/7) × 7 = 2 × 22 = 44 cm.'
    },
    {
      id: 'juring-num-01',
      topicId: 'luas_juring_tembereng',
      topicTitle: 'Luas Juring & Tembereng',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      type: 'numeric',
      question: 'Diketahui sudut pusat juring α = 90° pada lingkaran dengan jari-jari r = 14 cm (π = 22/7). Berapakah luas juring tersebut?',
      correctNumeric: 154,
      unit: 'cm²',
      tolerance: 0.5,
      formulaReference: 'L_juring = (α / 360°) · π · r²',
      hint: '90°/360° = 1/4 bagian lingkaran penuh. Luas lingkaran = (22/7) × 14 × 14 = 616.',
      explanation: 'L_juring = 1/4 × (22/7) × 14 × 14 = 1/4 × 616 = 154 cm².'
    },
    {
      id: 'sudut-num-01',
      topicId: 'sudut_pusat_keliling',
      topicTitle: 'Sudut Pusat & Sudut Keliling',
      difficulty: 'mudah',
      difficultyLabel: 'Dasar',
      type: 'numeric',
      question: 'Sudut pusat ∠AOB bernilai 130°. Berapakah besar sudut keliling ∠ACB yang menghadap busur yang sama?',
      correctNumeric: 65,
      unit: '°',
      tolerance: 0.1,
      formulaReference: 'Sudut Keliling = 1/2 · Sudut Pusat',
      hint: 'Sudut keliling selalu setengah dari sudut pusat jika menghadap busur yang sama.',
      explanation: 'Besar sudut keliling = 130° / 2 = 65°.'
    },
    {
      id: 'gs-num-01',
      topicId: 'garis_singgung',
      topicTitle: 'Garis Singgung Lingkaran',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      type: 'numeric',
      question: 'Sebuah titik luar P berjarak 25 cm dari pusat lingkaran O. Jika jari-jari lingkaran r = 7 cm, berapakah panjang ruas garis singgung dari P ke lingkaran?',
      correctNumeric: 24,
      unit: 'cm',
      tolerance: 0.2,
      formulaReference: 'd = √(OP² - r²)',
      hint: 'Gunakan teorema Pythagoras: d = √(25² - 7²) = √(625 - 49).',
      explanation: 'd = √(25² - 7²) = √(625 - 49) = √576 = 24 cm.'
    },
    {
      id: 'gspl-num-01',
      topicId: 'gspl',
      topicTitle: 'Garis Singgung Persekutuan Luar',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      type: 'numeric',
      question: 'Dua lingkaran memiliki jari-jari R = 15 cm dan r = 7 cm dengan jarak kedua pusat p = 17 cm. Hitung panjang garis singgung persekutuan luar (GSPL).',
      correctNumeric: 15,
      unit: 'cm',
      tolerance: 0.2,
      formulaReference: 'd = √(p² - (R - r)²)',
      hint: 'Selisih jari-jari: R - r = 15 - 7 = 8 cm. Lalu d = √(17² - 8²).',
      explanation: 'd = √(17² - 8²) = √(289 - 64) = √225 = 15 cm.'
    },
    {
      id: 'gspd-num-01',
      topicId: 'gspd',
      topicTitle: 'Garis Singgung Persekutuan Dalam',
      difficulty: 'sulit',
      difficultyLabel: 'Lanjutan',
      type: 'numeric',
      question: 'Dua lingkaran terpisah dengan jari-jari R = 9 cm dan r = 3 cm. Jarak antarpusat lingkaran p = 20 cm. Berapakah panjang garis singgung persekutuan dalam (GSPD)?',
      correctNumeric: 16,
      unit: 'cm',
      tolerance: 0.2,
      formulaReference: 'd = √(p² - (R + r)²)',
      hint: 'Jumlah jari-jari: R + r = 9 + 3 = 12 cm. Lalu d = √(20² - 12²).',
      explanation: 'd = √(20² - (9 + 3)²) = √(400 - 144) = √256 = 16 cm.'
    },
    {
      id: 'app-02',
      topicId: 'aplikasi_campuran',
      topicTitle: 'Aplikasi & Latihan Campuran',
      difficulty: 'sedang',
      difficultyLabel: 'Menengah',
      type: 'choice',
      question: 'Sebuah roda sepeda berdiameter 56 cm berputar sebanyak 50 kali putaran di lintasan lurus (π = 22/7). Berapakah jarak total yang ditempuh roda?',
      options: [
        '44 meter',
        '88 meter',
        '176 meter',
        '352 meter'
      ],
      correctAnswer: 1,
      formulaReference: 'Jarak = Jumlah Putaran × Keliling (K = π · d)',
      hint: 'Keliling roda = (22/7) × 56 cm = 176 cm. Kalikan dengan 50 lalu konversi ke meter.',
      explanation: 'K = (22/7) × 56 = 176 cm. Jarak = 50 × 176 cm = 8.800 cm = 88 meter.'
    }
  ];

  // Fungsi pengambil data
  const getAllQuestions = () => [...questionBank];

  const getQuestionById = (id) => questionBank.find(q => q.id === id) || null;

  const getQuestionsByTopic = (topicId) => {
    if (!topicId || topicId === 'all') return getAllQuestions();
    return questionBank.filter(q => q.topicId === topicId);
  };

  const getQuestionsByDifficulty = (difficulty) => {
    if (!difficulty || difficulty === 'all') return getAllQuestions();
    return questionBank.filter(q => q.difficulty === difficulty);
  };

  /**
   * Mengambil kumpulan soal teracak berdasarkan kriteria filter
   * @param {Object} options 
   * @param {string} [options.topicId]
   * @param {string} [options.difficulty]
   * @param {number} [options.count=5]
   * @returns {Array}
   */
  const getRandomQuestions = ({ topicId = 'all', difficulty = 'all', count = 5 } = {}) => {
    let pool = questionBank;
    if (topicId && topicId !== 'all') {
      pool = pool.filter(q => q.topicId === topicId);
    }
    if (difficulty && difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }

    // Jika filter terlalu spesifik sehingga jumlah soal sedikit, gabungkan fallback
    if (pool.length < count) {
      if (topicId && topicId !== 'all') {
        pool = questionBank.filter(q => q.topicId === topicId);
      }
      if (pool.length < count) {
        pool = questionBank;
      }
    }

    // Acak pool (Fisher-Yates shuffle)
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return {
    getAllQuestions,
    getQuestionById,
    getQuestionsByTopic,
    getQuestionsByDifficulty,
    getRandomQuestions
  };
})();

// Dukungan untuk lingkungan browser dan modul
if (typeof window !== 'undefined') {
  window.MathVerseQuestions = MathVerseQuestions;
}
if (typeof globalThis !== 'undefined') {
  globalThis.MathVerseQuestions = MathVerseQuestions;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathVerseQuestions;
}
