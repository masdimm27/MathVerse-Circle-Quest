# MathVerse — Circle Quest ⭕

> **Tagline:** *Learn the Concepts, Master the Challenge.*  
> **Platform Edukasi Geometri Lingkaran Interaktif Tingkat SMA (Fase F / Kelas XI)**

---

## 📌 1. Tentang Proyek

**MathVerse — Circle Quest** adalah website media pembelajaran matematika interaktif berbasis web yang dikembangkan khusus untuk materi **Geometri Lingkaran** jenjang Sekolah Menengah Atas (SMA / Kurikulum Merdeka Fase F). 

Website ini dirancang untuk proyek penilaian sekolah dengan tujuan membantu siswa memahami konsep-konsep abstrak lingkaran secara intuitif, terstruktur, visual, dan menyenangkan melalui gamifikasi *Circle Quest*.

Proyek ini telah melalui dua tahap pengembangan:
1. **Tahap 1 (Fondasi & Landing Page):** Menata arsitektur dan fondasi kode modular, sistem desain (Navy Gelap, Ungu Elektrik, Cyan), landing page modern, anatomi diagram lingkaran hero, dan bank soal awal.
2. **Tahap 2 (Halaman Belajar Materi Lengkap):** Membangun halaman belajar interaktif (`materi.html`) yang menyajikan 8 bab materi lengkap dengan tujuan pembelajaran, penjelasan teori, rumus dan arti simbol, simulasi diagram SVG interaktif dengan slider kontrol, contoh soal bertahap (dengan tombol show/hide pembahasan), kuis latihan pemahaman per bab, serta sistem pelacak progres belajar (*localStorage*).

---

## 🎨 2. Identitas Visual & Desain

- **Nama Produk:** MathVerse
- **Mode Belajar:** Circle Quest
- **Palet Warna Terukur:**
  - **Navy Gelap (`#0A0F1D`, `#0F172A`):** Warna kanvas utama yang memberikan nuansa futuristik, tenang, dan fokus belajar tinggi.
  - **Ungu Elektrik (`#7C3AED`, `#8B5CF6`):** Aksen identitas brand MathVerse yang melambangkan kecerdasan dan eksplorasi konsep.
  - **Cyan (`#06B6D4`, `#22D3EE`):** Aksen penegas untuk parameter matematika (jari-jari, sudut, formula, dan status interaktif).
  - **Emerald & Amber:** Penanda umpan balik jawaban benar dan status tingkat kesulitan.
- **Tipografi:** Google Fonts *Outfit* (heading display modern) dipadukan dengan *Plus Jakarta Sans* (keterbacaan teks utama yang jernih) dan *JetBrains Mono* (rumus matematis).
- **Gaya Komponen:** Kartu bersudut membulat (*rounded corners* 16–24px), kedalaman visual halus (*soft shadows*), efek *glassmorphism* elegan, dan transisi mikro yang halus tanpa efek neon yang berlebihan.

---

## 💻 3. Teknologi yang Digunakan

Proyek ini dibangun murni menggunakan standar web modern tanpa ketergantungan (*dependency*) pada framework frontend yang berat:
- **HTML5 Semantik:** Struktur halaman yang rapi, ramah SEO, dan mendukung aksesibilitas (*skip link*, atribut ARIA, *semantic tags*).
- **CSS3 Murni (Vanilla CSS):** Pemanfaatan *CSS Custom Properties* (variabel) untuk sistem tema, layout responsif (*CSS Grid* & *Flexbox*), serta animasi transisi yang menghormati preferensi `prefers-reduced-motion`.
- **JavaScript ES6+ Murni:** Kode modular terpisah (*separation of concerns*) dengan fungsi matematika deterministik dan penyimpanan status pada `localStorage`.
- **Vektor SVG Presisi:** Diagram geometri lingkaran matematika dibuat dalam format SVG murni sehingga tajam di semua resolusi layar tanpa risiko *broken image link*.

---

## 📁 4. Struktur Folder Proyek

```text
MathVerse-Circle-Quest/
│
├── index.html          # Halaman landing page utama & pratinjau topik
├── materi.html         # Halaman pusat pembelajaran 8 bab geometri lingkaran
│
├── css/
│   └── style.css       # Sistem desain visual, variabel tema (dark/light), & layout responsif
│
├── js/
│   ├── app.js          # Controller antarmuka landing page (tema, modal, kuis hero)
│   ├── geometry.js     # Modul rumus matematika lingkaran & kalkulator geometri
│   ├── materi.js       # Controller halaman belajar materi (diagram slider, progres, contoh soal)
│   └── questions.js    # Bank soal tantangan terstruktur untuk 8 bab SMA
│
├── assets/
│   └── favicon.svg     # Ikon vektor logo MathVerse untuk tab browser
│
└── README.md           # Dokumentasi lengkap proyek
```

### Penjelasan Setiap File:
1. **`index.html`**:  
   Landing page utama yang memuat Hero section dengan diagram anatomi interaktif, statistik pembelajaran, grid 8 modul materi dengan modal pratinjau rumus, widget simulasi kuis, dan leaderboard pelajar.
2. **`materi.html`**:  
   Halaman belajar mandiri komprehensif yang menampilkan bilah progres global, sidebar navigasi 8 bab, dan panel materi interaktif aktif.
3. **`css/style.css`**:  
   Mengatur seluruh aturan visual, tema Gelap (*Dark*) dan Terang (*Light*), desain kartu, kontrol slider rentang kustom, kotak pembahasan collapsible, dan tata letak responsif ponsel/tablet/desktop.
4. **`js/geometry.js`**:  
   Modul murni berisi fungsi kalkulasi rumus lingkaran SMA (keliling, luas juring, tembereng, relasi sudut pusat-keliling, panjang garis singgung dari titik luar, GSPL, GSPD, dan generator path SVG dinamis).
5. **`js/materi.js`**:  
   Pengendali utama halaman `materi.html`. Mengelola konten 8 bab, kontrol slider SVG dinamis, perhitungan numerik real-time, tombol toggle pembahasan soal, kuis latihan pemahaman, dan pelacakan status bab selesai di `localStorage`.
6. **`js/questions.js`**:  
   Kumpulan bank soal bertingkat (*mudah, sedang, sulit*) yang dikelompokkan ke dalam 8 topik geometri lingkaran dilengkapi kunci jawaban, petunjuk (*hint*), dan pembahasan terperinci.
7. **`js/app.js`**:  
   Mengatur logika interaktif pada landing page `index.html`.

---

## 📚 5. Cakupan 8 Bab Materi Pembelajaran

Setiap bab pada `materi.html` dilengkapi dengan tujuan pembelajaran, penjelasan konsep, rumus & arti simbol, diagram SVG interaktif dengan slider parameter, contoh soal bertahap (toggle pembahasan), dan latihan singkat:

1. **Bab 1: Unsur-unsur Lingkaran**  
   - Mengenal 8 elemen: titik pusat, jari-jari, diameter, busur, tali busur, tembereng, juring, dan apotema.
   - Sifat apotema tegak lurus membagi dua tali busur: $a = \sqrt{r^2 - (t/2)^2}$.
   - Diagram interaktif dengan tombol filter highlight unsur.

2. **Bab 2: Keliling dan Panjang Busur**  
   - Keliling $K = 2\pi r = \pi d$ dan panjang busur $s = \frac{\alpha}{360^\circ} \times 2\pi r$.
   - Diagram interaktif dengan slider jari-jari $r$ dan sudut pusat $\alpha$ yang memperbarui panjang busur dan rasio secara langsung.

3. **Bab 3: Luas Juring dan Tembereng**  
   - Luas lingkaran $L = \pi r^2$, luas juring $L_{\text{juring}} = \frac{\alpha}{360^\circ} \times \pi r^2$, dan luas tembereng $L_{\text{tembereng}} = L_{\text{juring}} - L_{\Delta}$.
   - Diagram interaktif dengan arsiran juring dan tembereng warna berbeda beserta kalkulasi live.

4. **Bab 4: Sudut Pusat dan Sudut Keliling**  
   - Teorema utama: $\angle\text{Pusat} = 2 \times \angle\text{Keliling}$ (jika menghadap busur sama).
   - Teorema Thales: Sudut keliling menghadap diameter selalu $90^\circ$ (siku-siku).
   - Diagram interaktif dengan slider sudut pusat yang secara dinamis menghitung dan menampilkan sudut keliling.

5. **Bab 5: Garis Singgung Lingkaran**  
   - Sifat tegak lurus jari-jari di titik singgung ($90^\circ$).
   - Panjang ruas garis singgung dari titik luar: $d = \sqrt{p^2 - r^2}$.
   - Diagram interaktif dengan slider jarak titik luar $p$ dan jari-jari $r$.

6. **Bab 6: Garis Singgung Persekutuan Luar (GSPL)**  
   - Menghubungkan sisi luar dua lingkaran terpisah tanpa memotong garis antar pusat.
   - Rumus: $d = \sqrt{p^2 - (R - r)^2}$ menggunakan selisih jari-jari.
   - Diagram interaktif dengan slider $p$, $R$, dan $r$ serta visualisasi segitiga siku-siku bantu.

7. **Bab 7: Garis Singgung Persekutuan Dalam (GSPD)**  
   - Menyilang di antara dua lingkaran dan memotong garis hubung antar pusat.
   - Rumus: $d = \sqrt{p^2 - (R + r)^2}$ menggunakan penjumlahan jari-jari.
   - Diagram interaktif dengan visualisasi garis silang dan validasi $p > (R + r)$.

8. **Bab 8: Soal Aplikasi dan Gabungan Materi Lingkaran**  
   - Pemecahan masalah kontekstual: transmisi sabuk katrol dan rantai roda gigi terbuka.
   - Menghitung rentang lurus bebas $2d$ dan total panjang sabuk.
   - Diagram interaktif sistem dua puli dengan kalkulasi real-time.

---

## 🚀 6. Cara Menjalankan Website Secara Lokal

Anda dapat menjalankan website ini di komputer lokal dengan salah satu cara berikut:

### Opsi A: Langsung Buka di Browser (Paling Mudah)
1. Buka folder proyek `MathVerse-Circle-Quest` di File Explorer komputer Anda.
2. Klik ganda (*double click*) pada file `index.html` untuk membuka landing page, atau klik ganda `materi.html` untuk langsung masuk ke modul pembelajaran.
3. Website akan langsung terbuka di browser Anda (Chrome, Edge, Firefox, dsb.).

### Opsi B: Menggunakan Node.js / `npx serve`
```bash
# Di direktori proyek:
npx -y serve .
```
Lalu buka alamat URL yang muncul di terminal (biasanya `http://localhost:3000`).

### Opsi C: Menggunakan Ekstensi VS Code *Live Server*
1. Buka folder `MathVerse-Circle-Quest` di Visual Studio Code.
2. Klik kanan pada file `index.html` atau `materi.html` dan pilih **Open with Live Server**.

---

## 🔍 7. Cara Menguji Fitur Halaman Belajar Materi

Setelah membuka `materi.html` di browser:
1. **Navigasi Bab:**  
   Klik salah satu bab pada sidebar kiri (misalnya Bab 2 atau Bab 6). Perhatikan bahwa judul, tujuan, konsep, rumus, diagram interaktif, contoh soal, dan latihan berganti seketika. URL browser juga diperbarui dengan parameter `?bab=X`.
2. **Kontrol Diagram SVG Interaktif:**  
   Geser slider parameter (misal: slider sudut $\alpha$ atau jari-jari $r$). Perhatikan bahwa kurva busur, arsiran juring, dan posisi garis singgung berubah secara mulus, serta angka hasil perhitungan pada baris statistik di bawah diagram diperbarui seketika.
3. **Toggle Pembahasan Contoh Soal:**  
   Klik tombol **"Tampilkan Pembahasan"** pada bagian contoh soal. Drawer pembahasan akan terbuka menampilkan Langkah 1 (Diketahui), Langkah 2 (Rumus), Langkah 3 (Perhitungan), dan Langkah 4 (Kesimpulan). Klik kembali untuk menyembunyikan pembahasan.
4. **Kuis Latihan Pemahaman:**  
   Pilih salah satu opsi jawaban (A, B, C, D) pada latihan di bagian bawah. Tombol akan langsung berubah warna (hijau untuk benar, merah jika salah) dan kotak pembahasan lengkap akan muncul.
5. **Pelacak Progres Belajar:**  
   Klik tombol **"Tandai Selesai"** di bagian atas atau bawah bab. Perhatikan bahwa ikon centang hijau muncul pada bab tersebut di sidebar, persentase progres global di kartu atas bertambah, dan status tersimpan otomatis di browser (`localStorage`). Coba segarkan (*refresh*) halaman untuk memastikan progres tetap tersimpan.
6. **Responsivitas Layar:**  
   Uji halaman pada ukuran laptop maupun resolusi layar ponsel (Ctrl+Shift+M). Pada layar kecil, sidebar dan kontrol bertata letak secara vertikal yang nyaman diakses dengan jari.
7. **Peralihan Tema:**  
   Klik tombol tema di navigasi atas untuk berpindah antara mode Gelap (*Dark*) dan Terang (*Light*).

---

## 🗺️ 8. Peta Jalan Pengembangan (Roadmap)

- [x] **Tahap 1:** Fondasi Proyek, Desain Sistem, Landing Page, & Modul Inti Geometri (Selesai).
- [x] **Tahap 2:** Halaman Belajar Materi Fungsional Penuh, Diagram Interaktif dengan Slider Parameter, Pembahasan Bertahap, & Pelacak Progres (Selesai).
- [ ] **Tahap 3:** Mesin Game & Kuis Penuh *Circle Quest* (Skor Riil, Timer, Evaluasi Tingkat Pemahaman, & Penyimpanan XP).
- [ ] **Tahap 4:** Integrasi Papan Peringkat Lokal Dinamis & Fitur Ekspor Ringkasan Rumus PDF.
