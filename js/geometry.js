/**
 * MathVerse — Circle Quest
 * js/geometry.js
 * 
 * Modul rumus dan komputasi geometri lingkaran.
 * Berisi kalkulator rumus matematika SMA dan fungsi pembantu (helper)
 * untuk visualisasi elemen lingkaran.
 */

const MathVerseGeometry = (() => {
  'use strict';

  // Konstanta Pi presisi standar
  const PI = Math.PI;

  /**
   * Mengonversi derajat ke radian
   * @param {number} deg - Nilai sudut dalam derajat
   * @returns {number} Nilai sudut dalam radian
   */
  const degToRad = (deg) => (deg * PI) / 180;

  /**
   * Mengonversi radian ke derajat
   * @param {number} rad - Nilai sudut dalam radian
   * @returns {number} Nilai sudut dalam derajat
   */
  const radToDeg = (rad) => (rad * 180) / PI;

  /**
   * 1. Keliling Lingkaran: K = 2 * π * r
   * @param {number} r - Jari-jari lingkaran
   * @returns {number} Keliling lingkaran
   */
  const circleCircumference = (r) => {
    if (r <= 0) return 0;
    return 2 * PI * r;
  };

  /**
   * 2. Luas Lingkaran: L = π * r²
   * @param {number} r - Jari-jari lingkaran
   * @returns {number} Luas lingkaran
   */
  const circleArea = (r) => {
    if (r <= 0) return 0;
    return PI * r * r;
  };

  /**
   * 3. Panjang Busur: s = (sudut / 360°) * (2 * π * r)
   * @param {number} r - Jari-jari lingkaran
   * @param {number} angleDeg - Sudut pusat dalam derajat
   * @returns {number} Panjang busur
   */
  const arcLength = (r, angleDeg) => {
    if (r <= 0 || angleDeg <= 0) return 0;
    return (angleDeg / 360) * circleCircumference(r);
  };

  /**
   * 4. Luas Juring: L_juring = (sudut / 360°) * (π * r²)
   * @param {number} r - Jari-jari lingkaran
   * @param {number} angleDeg - Sudut pusat dalam derajat
   * @returns {number} Luas juring
   */
  const sectorArea = (r, angleDeg) => {
    if (r <= 0 || angleDeg <= 0) return 0;
    return (angleDeg / 360) * circleArea(r);
  };

  /**
   * 5. Luas Tembereng: L_tembereng = Luas Juring - Luas Segitiga
   * Segitiga dibentuk oleh dua jari-jari dan tali busur: L_segitiga = 0.5 * r² * sin(θ)
   * @param {number} r - Jari-jari lingkaran
   * @param {number} angleDeg - Sudut pusat dalam derajat
   * @returns {number} Luas tembereng
   */
  const segmentArea = (r, angleDeg) => {
    if (r <= 0 || angleDeg <= 0 || angleDeg >= 360) return 0;
    const lJuring = sectorArea(r, angleDeg);
    const rad = degToRad(angleDeg);
    const lSegitiga = 0.5 * r * r * Math.sin(rad);
    return Math.max(0, lJuring - lSegitiga);
  };

  /**
   * 6. Hubungan Sudut Pusat dan Sudut Keliling
   * Sudut pusat = 2 * Sudut keliling (menghadap busur yang sama)
   * @param {number} inscribedAngle - Sudut keliling
   * @returns {number} Sudut pusat
   */
  const centralAngleFromInscribed = (inscribedAngle) => inscribedAngle * 2;

  /**
   * Sudut keliling = 0.5 * Sudut pusat
   * @param {number} centralAngle - Sudut pusat
   * @returns {number} Sudut keliling
   */
  const inscribedAngleFromCentral = (centralAngle) => centralAngle / 2;

  /**
   * 7. Garis Singgung dari Titik di Luar Lingkaran
   * d = √(p² - r²)
   * @param {number} p - Jarak titik luar ke pusat lingkaran
   * @param {number} r - Jari-jari lingkaran
   * @returns {number|null} Panjang garis singgung (null jika titik di dalam lingkaran)
   */
  const tangentLengthFromPoint = (p, r) => {
    if (p <= r) return null;
    return Math.sqrt(p * p - r * r);
  };

  /**
   * 8. Garis Singgung Persekutuan Luar (GSPL)
   * Rumus: d = √(p² - (R - r)²)
   * @param {number} p - Jarak antar pusat kedua lingkaran
   * @param {number} R - Jari-jari lingkaran besar
   * @param {number} r - Jari-jari lingkaran kecil
   * @returns {number|null} Panjang GSPL
   */
  const gsplLength = (p, R, r) => {
    const diff = Math.abs(R - r);
    if (p <= diff) return null; // Lingkaran bersinggungan di dalam atau konsentris
    return Math.sqrt(p * p - diff * diff);
  };

  /**
   * 9. Garis Singgung Persekutuan Dalam (GSPD)
   * Rumus: d = √(p² - (R + r)²)
   * @param {number} p - Jarak antar pusat kedua lingkaran
   * @param {number} R - Jari-jari lingkaran besar
   * @param {number} r - Jari-jari lingkaran kecil
   * @returns {number|null} Panjang GSPD
   */
  const gspdLength = (p, R, r) => {
    const sum = R + r;
    if (p <= sum) return null; // Kedua lingkaran berpotongan / bersinggungan luar sehingga tidak ada GSPD
    return Math.sqrt(p * p - sum * sum);
  };

  /**
   * Helper pembuatan koordinat titik pada lingkaran
   * @param {number} cx - Pusat X
   * @param {number} cy - Pusat Y
   * @param {number} r - Jari-jari
   * @param {number} angleDeg - Sudut dalam derajat
   * @returns {{x: number, y: number}} Koordinat X dan Y
   */
  const getCirclePoint = (cx, cy, r, angleDeg) => {
    const rad = degToRad(angleDeg);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  /**
   * Helper SVG path generator untuk juring lingkaran
   * @param {number} cx - Pusat X
   * @param {number} cy - Pusat Y
   * @param {number} r - Jari-jari
   * @param {number} startAngle - Sudut awal (derajat)
   * @param {number} endAngle - Sudut akhir (derajat)
   * @returns {string} String path SVG (d attribute)
   */
  const generateSectorPath = (cx, cy, r, startAngle, endAngle) => {
    const p1 = getCirclePoint(cx, cy, r, startAngle);
    const p2 = getCirclePoint(cx, cy, r, endAngle);
    const angleDiff = (endAngle - startAngle + 360) % 360;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
  };

  /**
   * Helper SVG path generator untuk busur lingkaran (hanya garis kurva lengkung)
   * @param {number} cx - Pusat X
   * @param {number} cy - Pusat Y
   * @param {number} r - Jari-jari
   * @param {number} startAngle - Sudut awal (derajat)
   * @param {number} endAngle - Sudut akhir (derajat)
   * @returns {string} String path SVG (d attribute)
   */
  const generateArcPath = (cx, cy, r, startAngle, endAngle) => {
    const p1 = getCirclePoint(cx, cy, r, startAngle);
    const p2 = getCirclePoint(cx, cy, r, endAngle);
    const angleDiff = (endAngle - startAngle + 360) % 360;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;

    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  };

  /**
   * Helper SVG path generator untuk tembereng (daerah antara busur dan tali busur)
   * @param {number} cx - Pusat X
   * @param {number} cy - Pusat Y
   * @param {number} r - Jari-jari
   * @param {number} startAngle - Sudut awal (derajat)
   * @param {number} endAngle - Sudut akhir (derajat)
   * @returns {string} String path SVG (d attribute)
   */
  const generateSegmentPath = (cx, cy, r, startAngle, endAngle) => {
    const p1 = getCirclePoint(cx, cy, r, startAngle);
    const p2 = getCirclePoint(cx, cy, r, endAngle);
    const angleDiff = (endAngle - startAngle + 360) % 360;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;

    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
  };

  /**
   * Format angka desimal agar rapi tanpa trailing zero berlebih
   * @param {number} num 
   * @param {number} decimals 
   * @returns {string}
   */
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(num * factor) / factor;
    return rounded.toLocaleString('id-ID', { maximumFractionDigits: decimals });
  };

  /**
   * Menghitung titik singgung dari titik luar (px, py) ke lingkaran (cx, cy, r)
   * @param {number} cx 
   * @param {number} cy 
   * @param {number} r 
   * @param {number} px 
   * @param {number} py 
   */
  const calculateTangentPoints = (cx, cy, r, px, py) => {
    const dx = px - cx;
    const dy = py - cy;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist <= r) return null; // Titik di dalam lingkaran

    const baseAngle = Math.atan2(dy, dx);
    const alpha = Math.acos(r / dist);

    const t1Angle = baseAngle - alpha;
    const t2Angle = baseAngle + alpha;

    return {
      t1: { x: cx + r * Math.cos(t1Angle), y: cy + r * Math.sin(t1Angle), angle: radToDeg(t1Angle) },
      t2: { x: cx + r * Math.cos(t2Angle), y: cy + r * Math.sin(t2Angle), angle: radToDeg(t2Angle) },
      tangentLength: Math.sqrt(distSq - r * r),
      dist
    };
  };

  /**
   * Menghitung geometri garis singgung persekutuan luar (GSPL)
   * @param {number} cx1 - Pusat X lingkaran 1 (besar)
   * @param {number} cy1 - Pusat Y lingkaran 1
   * @param {number} R - Jari-jari lingkaran 1
   * @param {number} cx2 - Pusat X lingkaran 2 (kecil)
   * @param {number} cy2 - Pusat Y lingkaran 2
   * @param {number} r - Jari-jari lingkaran 2
   */
  const calculateGSPLGeometry = (cx1, cy1, R, cx2, cy2, r) => {
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const diff = R - r;

    if (dist <= Math.abs(diff)) return null;

    const angle = Math.atan2(dy, dx);
    const phi = Math.asin(diff / dist);

    // Titik singgung atas
    const angleTop1 = angle + Math.PI / 2 - phi;
    const angleTop2 = angle + Math.PI / 2 - phi;

    const pt1Top = { x: cx1 + R * Math.cos(angleTop1), y: cy1 + R * Math.sin(angleTop1) };
    const pt2Top = { x: cx2 + r * Math.cos(angleTop2), y: cy2 + r * Math.sin(angleTop2) };

    // Titik singgung bawah
    const angleBtm1 = angle - Math.PI / 2 + phi;
    const angleBtm2 = angle - Math.PI / 2 + phi;

    const pt1Btm = { x: cx1 + R * Math.cos(angleBtm1), y: cy1 + R * Math.sin(angleBtm1) };
    const pt2Btm = { x: cx2 + r * Math.cos(angleBtm2), y: cy2 + r * Math.sin(angleBtm2) };

    return {
      dist,
      length: Math.sqrt(dist * dist - diff * diff),
      top: { p1: pt1Top, p2: pt2Top },
      bottom: { p1: pt1Btm, p2: pt2Btm }
    };
  };

  /**
   * Menghitung geometri garis singgung persekutuan dalam (GSPD)
   * @param {number} cx1 
   * @param {number} cy1 
   * @param {number} R 
   * @param {number} cx2 
   * @param {number} cy2 
   * @param {number} r 
   */
  const calculateGSPDGeometry = (cx1, cy1, R, cx2, cy2, r) => {
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sum = R + r;

    if (dist <= sum) return null;

    const angle = Math.atan2(dy, dx);
    const phi = Math.asin(sum / dist);

    // Garis 1 (silang atas ke bawah)
    const angle1A = angle + Math.PI / 2 - phi;
    const angle1B = angle - Math.PI / 2 - phi;

    const pt1A = { x: cx1 + R * Math.cos(angle1A), y: cy1 + R * Math.sin(angle1A) };
    const pt1B = { x: cx2 + r * Math.cos(angle1B), y: cy2 + r * Math.sin(angle1B) };

    // Garis 2 (silang bawah ke atas)
    const angle2A = angle - Math.PI / 2 + phi;
    const angle2B = angle + Math.PI / 2 + phi;

    const pt2A = { x: cx1 + R * Math.cos(angle2A), y: cy1 + R * Math.sin(angle2A) };
    const pt2B = { x: cx2 + r * Math.cos(angle2B), y: cy2 + r * Math.sin(angle2B) };

    return {
      dist,
      length: Math.sqrt(dist * dist - sum * sum),
      line1: { p1: pt1A, p2: pt1B },
      line2: { p2: pt2A, p2B: pt2B }
    };
  };

  // API publik
  return {
    PI,
    degToRad,
    radToDeg,
    circleCircumference,
    circleArea,
    arcLength,
    sectorArea,
    segmentArea,
    centralAngleFromInscribed,
    inscribedAngleFromCentral,
    tangentLengthFromPoint,
    gsplLength,
    gspdLength,
    getCirclePoint,
    generateSectorPath,
    generateArcPath,
    generateSegmentPath,
    formatNumber,
    calculateTangentPoints,
    calculateGSPLGeometry,
    calculateGSPDGeometry
  };
})();

// Dukungan untuk lingkungan browser dan modul
if (typeof window !== 'undefined') {
  window.MathVerseGeometry = MathVerseGeometry;
}
if (typeof globalThis !== 'undefined') {
  globalThis.MathVerseGeometry = MathVerseGeometry;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathVerseGeometry;
}
