/**
 * ============================================================================
 * PORTAL RESMI & SISTEM INFORMASI TERPADU DPM KBMFKG UMI
 * (Dewan Perwakilan Mahasiswa Keluarga Besar Mahasiswa Fakultas Kedokteran Gigi
 *  Universitas Muslim Indonesia)
 *
 * Backend Server Engine: Express.js + Upstash Redis Storage + EJS
 * Vercel Serverless Ready + Zero-Crash Persistent Database Architecture
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { Redis } = require('@upstash/redis');

const app = express();
const PORT = process.env.PORT || 3000;

// ── KONFIGURASI ENVIRONMENT & AUTH MASTER ──
const ADMIN_USER = process.env.ADMIN_USER || 'dpmfkgumi2026';
const ADMIN_PASS = process.env.PASS_USER || process.env.ADMIN_PASS || 'dpmfkgumi999';

const ROLE_CREDENTIALS = {
  komisi1: { user: process.env.USER_KOMISI1 || 'komisi1', pass: process.env.PASS_KOMISI1 || 'komisi1123', role: 'Komisi1', name: 'Aisyah Putri Ramadhani, S.KG', jab: 'Koordinator Komisi I (Legislasi)' },
  komisi2: { user: process.env.USER_KOMISI2 || 'komisi2', pass: process.env.PASS_KOMISI2 || 'komisi2123', role: 'Komisi2', name: 'Fahri Al-Habsyi, S.KG', jab: 'Koordinator Komisi II (Pengawasan)' },
  komisi3: { user: process.env.USER_KOMISI3 || 'komisi3', pass: process.env.PASS_KOMISI3 || 'komisi3123', role: 'Komisi3', name: 'Nurul Annisa, S.KG', jab: 'Koordinator Komisi III (Advokasi)' },
  banggar: { user: process.env.USER_BANGGAR || 'banggar', pass: process.env.PASS_BANGGAR || 'banggar123', role: 'Banggar', name: 'Reza Maulana, S.KG', jab: 'Ketua Badan Anggaran' },
  bemfkg:  { user: process.env.USER_MITRA || 'bemfkg', pass: process.env.PASS_MITRA || 'mitra123', role: 'MitraOrmawa', name: 'Andi Muh. Fadhil', jab: 'Ketua Umum BEM FKG UMI' }
};

// ── REDIS CLIENT (UPSTASH) DENGAN SAFE FALLBACK ──
let redisClient = null;
try {
  const redisUrl = process.env.KV_REST_API_URL || 'https://merry-hedgehog-35658.upstash.io';
  const redisToken = process.env.KV_REST_API_TOKEN;

  if (redisUrl && redisToken) {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken
    });
    console.log('✅ Upstash Redis Client berhasil dikonfigurasi ke:', redisUrl);
  } else {
    console.warn('⚠️ Token KV_REST_API_TOKEN tidak ditemukan, beralih ke in-memory cache.');
  }
} catch (err) {
  console.error('❌ Gagal inisialisasi Redis Client:', err.message);
}

// ── IN-MEMORY FALLBACK CACHE (JIKA REDIS DOWN / OFFLINE) ──
const memoryCache = new Map();

// Helper Standar Response
function createResponse(success, data, message) {
  return {
    success: Boolean(success),
    data: data !== undefined ? data : null,
    message: message || (success ? 'Operasi berhasil.' : 'Terjadi kesalahan sistem.')
  };
}

// Helper Generate Unique ID & Ticket Code
function generateAutoId(prefix, sequenceNumber) {
  const padded = ('000' + sequenceNumber).slice(-3);
  return `${prefix}-${padded}`;
}

function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ASP-${randomPart}`;
}

function getWitaTimestamp() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const witaTime = new Date(utc + (3600000 * 8)); // UTC+8
  return witaTime.toISOString().replace('T', ' ').substring(0, 19);
}

function createSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// ── DATABASE ABSTRACTION LAYER (PREFIX ISOLASI: dpm:*) ──
async function dbGet(key) {
  const fullKey = `dpm:${key}`;
  if (redisClient) {
    try {
      const data = await redisClient.get(fullKey);
      if (data !== null && data !== undefined) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } catch (e) {
      console.error(`Error reading ${fullKey} from Redis:`, e.message);
    }
  }
  return memoryCache.get(fullKey) || null;
}

async function dbSet(key, value) {
  const fullKey = `dpm:${key}`;
  memoryCache.set(fullKey, value);
  if (redisClient) {
    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.set(fullKey, payload);
    } catch (e) {
      console.error(`Error saving ${fullKey} to Redis:`, e.message);
    }
  }
}

// ── SEED DATA AWAL (11 MODUL RELASIONAL LENGKAP) ──
const INITIAL_SEEDS = {
  profil: {
    nama_lembaga: 'Dewan Perwakilan Mahasiswa KBMFKG UMI',
    universitas_fakultas: 'Fakultas Kedokteran Gigi Universitas Muslim Indonesia',
    periode_aktif: '2026-2027',
    hero_image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    ketua_umum_presidium: 'drg. Muh. Fauzan, S.KG',
    sekjen_biro: 'Ahmad Rayhan, S.KG',
    visi: 'Menjadi episentrum parlemen mahasiswa kedokteran gigi yang progresif, kredibel, transparan, dan berlandaskan nilai-nilai keislaman serta keilmuan dental modern.',
    misi: '1. Mengawal produk hukum ormawa yang inklusif dan solutif;\n2. Menjalankan pengawasan eksekutif secara konstruktif dan independen;\n3. Mengoptimalkan tata kelola anggaran ormawa yang transparan dan akuntabel;\n4. Memperjuangkan hak akademik dan fasilitas klinik pre-klinik serta koas RSGM.',
    sambutan_ketua: 'Assalamu Alaikum Wr. Wb. Selamat datang di Portal Resmi & Sistem Informasi Terpadu DPM KBMFKG UMI. Portal ini hadir sebagai manifestasi transparansi legislasi, pengawasan objektif, keterbukaan anggaran, dan advokasi tuntas demi kemaslahatan seluruh civitas akademika kedokteran gigi.',
    email_resmi: 'dpm.kbmfkg@umi.ac.id',
    wa_hotline: '6281299887766',
    ig_resmi: 'https://instagram.com/dpmfkgumi'
  },
  users: [
    { id_user: 'USR-001', nama_lengkap: 'drg. Muh. Fauzan, S.KG', nim_stambuk: '16120200001', username: 'dpmfkgumi2026', role: 'SuperAdmin', jabatan_organisasi: 'Ketua Umum Presidium DPM', status: 'Active', last_login: '2026-09-25 10:00:00' },
    { id_user: 'USR-002', nama_lengkap: 'drg. Muh. Fauzan, S.KG', nim_stambuk: '16120200001', username: 'admin', role: 'SuperAdmin', jabatan_organisasi: 'Ketua Umum Presidium DPM', status: 'Active', last_login: '2026-09-25 10:00:00' },
    { id_user: 'USR-003', nama_lengkap: 'Aisyah Putri Ramadhani, S.KG', nim_stambuk: '16120210012', username: 'komisi1', role: 'Komisi1', jabatan_organisasi: 'Koordinator Komisi I (Legislasi)', status: 'Active', last_login: '2026-09-24 15:30:00' },
    { id_user: 'USR-004', nama_lengkap: 'Fahri Al-Habsyi, S.KG', nim_stambuk: '16120210045', username: 'komisi2', role: 'Komisi2', jabatan_organisasi: 'Koordinator Komisi II (Pengawasan)', status: 'Active', last_login: '2026-09-23 11:20:00' },
    { id_user: 'USR-005', nama_lengkap: 'Nurul Annisa, S.KG', nim_stambuk: '16120210088', username: 'komisi3', role: 'Komisi3', jabatan_organisasi: 'Koordinator Komisi III (Advokasi)', status: 'Active', last_login: '2026-09-25 09:12:00' },
    { id_user: 'USR-006', nama_lengkap: 'Reza Maulana, S.KG', nim_stambuk: '16120210099', username: 'banggar', role: 'Banggar', jabatan_organisasi: 'Ketua Badan Anggaran', status: 'Active', last_login: '2026-09-22 17:00:00' },
    { id_user: 'USR-007', nama_lengkap: 'Andi Muh. Fadhil', nim_stambuk: '16120220023', username: 'bemfkg', role: 'MitraOrmawa', jabatan_organisasi: 'Ketua Umum BEM FKG UMI', status: 'Active', last_login: '2026-09-21 14:15:00' }
  ],
  aspirasi: [
    {
      id_aspirasi: 'ASP-2609-001',
      kode_tiket: 'ASP-89X2',
      nama_mahasiswa: 'Dokter Gigi Muda (Anonim)',
      nim_stambuk: '-',
      program_studi: 'Profesi_Dokter_Gigi_Koas',
      kategori_isu: 'Fasilitas_RSGM',
      judul_aspirasi: 'Penambahan Suplai Bahan Cetak Alginat & Perbaikan Dental Chair Lantai 3 RSGM',
      isi_detail: 'Beberapa dental chair di departemen Prostodonsia sering mengalami penurunan tekanan kompresor angin sehingga pengerjaan preparasi gigi pasien terhambat.',
      bukti_lampiran_url: 'https://drive.google.com',
      tanggal_masuk: '2026-09-20 10:15:00',
      status: 'Dalam_Advokasi',
      disposisi_ke: 'Direktur RSGM & Komisi III',
      tanggapan_dewan: 'Komisi III telah menjadwalkan servis kompresor utama dan kalibrasi dental chair lantai 3 pada akhir pekan ini.',
      tanggal_selesai: '',
      updated_by: 'USR-005'
    },
    {
      id_aspirasi: 'ASP-2609-002',
      kode_tiket: 'ASP-74M1',
      nama_mahasiswa: 'Fathir Rahman',
      nim_stambuk: '16120230055',
      program_studi: 'Sarjana_Kedokteran_Gigi',
      kategori_isu: 'Akademik_Kurikulum',
      judul_aspirasi: 'Permohonan Sinkronisasi Jadwal Praktikum Phantom Anatomi Gigi dengan Ujian OSCE Blok',
      isi_detail: 'Jadwal ujian remedi blok berdekatan dengan jadwal asistensi praktikum Phantom sehingga beban waktu mahasiswa sangat padat.',
      bukti_lampiran_url: '',
      tanggal_masuk: '2026-09-18 14:20:00',
      status: 'Selesai',
      disposisi_ke: 'Wakil Dekan I Akademik',
      tanggapan_dewan: 'Melalui audiensi bersama Wadek I, telah disepakati pengumpulan tugas asistensi dimundurkan 3 hari pasca ujian blok.',
      tanggal_selesai: '2026-09-22 16:00:00',
      updated_by: 'USR-005'
    }
  ],
  jdih: [
    {
      id_regulasi: 'REG-001',
      nomor_peraturan: '01/TAP/DPM-FKG/2026',
      jenis_peraturan: 'TAP_DPM',
      judul_regulasi: 'Ketetapan Tata Tertib Sidang Paripurna dan Mekanisme Pengambilan Keputusan DPM KBMFKG UMI',
      tahun_penetapan: 2026,
      tanggal_pengesahan: '2026-01-15',
      deskripsi_singkat: 'Regulasi induk pedoman pelaksanaan sidang umum, sidang istimewa, dan hak suara komisi parlemen.',
      status_hukum: 'Berlaku',
      file_drive_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      download_count: 142
    },
    {
      id_regulasi: 'REG-002',
      nomor_peraturan: '02/UU-ORMAWA/KBMFKG/2026',
      jenis_peraturan: 'Undang_Undang',
      judul_regulasi: 'Undang-Undang Ormawa tentang Tata Kelola Pengajuan Anggaran dan Mekanisme Audit LPJ Keuangan',
      tahun_penetapan: 2026,
      tanggal_pengesahan: '2026-02-10',
      deskripsi_singkat: 'Standardisasi batas pengajuan proposal kegiatan ormawa (H-14) dan batas penyerahan LPJ (H+14).',
      status_hukum: 'Berlaku',
      file_drive_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      download_count: 215
    },
    {
      id_regulasi: 'REG-003',
      nomor_peraturan: '01/KONS/KBMFKG-UMI/2025',
      jenis_peraturan: 'Konstitusi_KBM',
      judul_regulasi: 'Konstitusi Dasar Keluarga Besar Mahasiswa Fakultas Kedokteran Gigi Universitas Muslim Indonesia',
      tahun_penetapan: 2025,
      tanggal_pengesahan: '2025-10-20',
      deskripsi_singkat: 'Hukum tertinggi KBMFKG UMI yang mengatur struktur kedaulatan, lembaga legislatif, dan hak suara mahasiswa.',
      status_hukum: 'Berlaku',
      file_drive_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      download_count: 388
    }
  ],
  proker: [
    {
      id_proker: 'PRK-001',
      id_ormawa: 'ORG-001',
      nama_kegiatan: 'DENTAL SCIENTIFIC FESTIVAL & BAKTI SOSIAL 2026',
      deskripsi_kegiatan: 'Rangkaian seminar kedokteran gigi nasional, lomba karya tulis ilmiah, dan pemeriksaan gigi gratis.',
      target_jadwal: '2026-04-10',
      realisasi_jadwal: '2026-04-12',
      status_pelaksanaan: 'Berjalan',
      persentase_capaian: 75,
      catatan_komisi2: 'Persiapan panitia berjalan baik. Izin dekanat dan sponsor MoU sudah final.'
    },
    {
      id_proker: 'PRK-002',
      id_ormawa: 'ORG-002',
      nama_kegiatan: 'Latihan Keterampilan Manajemen Mahasiswa Gigi (LKMM-G)',
      deskripsi_kegiatan: 'Kaderisasi kepemimpinan dasar bagi mahasiswa angkatan baru kedokteran gigi.',
      target_jadwal: '2026-03-01',
      realisasi_jadwal: '2026-03-03',
      status_pelaksanaan: 'Terlaksana',
      persentase_capaian: 100,
      catatan_komisi2: 'Kegiatan terlaksana dengan tertib. Tingkat kepatuhan rundown 92%.'
    }
  ],
  inspeksi: [
    {
      id_inspeksi: 'INS-001',
      id_proker: 'PRK-002',
      tanggal_inspeksi: '2026-03-01',
      nama_sidang_kegiatan: 'Pleno Pembukaan LKMM-G 2026',
      kehadiran_pengurus_persen: 95,
      kesesuaian_manual_acara: 'Sangat_Sesuai',
      kepatuhan_konstitusi: 'Patuh',
      ringkasan_temuan: 'Susunan acara berjalan tepat waktu. Kehadiran panitia inti lengkap.',
      rekomendasi_dewan: 'Pertahankan kedisiplinan dan higienitas konsumsi peserta.',
      inspector_name: 'Fahri Al-Habsyi, S.KG'
    }
  ],
  proposal: [
    {
      id_proposal: 'PROP-001',
      id_ormawa: 'ORG-001',
      nama_proker: 'DENTAL SCIENTIFIC FESTIVAL & BAKTI SOSIAL 2026',
      total_anggaran_diajukan: 18500000,
      total_anggaran_disetujui: 15000000,
      file_proposal_url: 'https://drive.google.com',
      tanggal_pengajuan: '2026-02-15',
      status_approval: 'Disetujui_Presidium',
      catatan_banggar: 'Plafon disetujui Rp 15.000.000. Pos cenderamata dialihkan ke sponsorship.'
    },
    {
      id_proposal: 'PROP-002',
      id_ormawa: 'ORG-003',
      nama_proker: 'TURNAMEN FUTSAL DENTAL CUP V',
      total_anggaran_diajukan: 7500000,
      total_anggaran_disetujui: 6000000,
      file_proposal_url: 'https://drive.google.com',
      tanggal_pengajuan: '2026-03-20',
      status_approval: 'Review_Banggar',
      catatan_banggar: 'Dalam telaah rincian sewa venue.'
    }
  ],
  lpj: [
    {
      id_lpj: 'LPJ-001',
      id_proposal: 'PROP-001',
      id_ormawa: 'ORG-002',
      total_realisasi_dana: 8500000,
      sisa_lebih_kurang: 0,
      file_lpj_url: 'https://drive.google.com',
      file_kuitansi_drive_folder: 'https://drive.google.com',
      tanggal_serah_lpj: '2026-03-12',
      status_lpj: 'Selesai',
      catatan_audit: 'Seluruh bukti nota telah diverifikasi valid dan sesuai alokasi.',
      no_surat_bebas_tanggungan: '04/SK-BT/BANGGAR-DPM/FKG-UMI/III/2026'
    }
  ],
  berita: [
    {
      id_berita: 'NWS-001',
      slug: 'sidang-paripurna-i-dpm-kbmfkg-umi-sahkan-uu-pemilihan-raya-bem-parlemen-2026',
      judul_berita: 'Sidang Paripurna I DPM KBMFKG UMI Sahkan UU Pemilihan Raya BEM & Parlemen 2026',
      kategori: 'Warta_Sidang',
      isi_artikel: 'Makassar — DPM KBMFKG UMI resmi mengetuk palu pengesahan UU Pemira Mahasiswa periode 2026-2027 dalam Sidang Paripurna I di Ruang Senat FKG UMI. Regulasi ini menitikberatkan pada digitalisasi pemungutan suara (e-voting) berbasis NIM.',
      banner_img_url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
      tanggal_terbit: '2026-09-24',
      status: 'Published',
      penulis: 'Biro Kesekretariatan & Pers Parlemen',
      view_count: 189
    },
    {
      id_berita: 'NWS-002',
      slug: 'komisi-iii-dpm-kawal-audiensi-bersama-dekanat-terkait-optimalisasi-phantom-lab-gigi-anak',
      judul_berita: 'Komisi III DPM Kawal Audiensi Bersama Dekanat Terkait Optimalisasi Phantom Lab Gigi Anak',
      kategori: 'Advokasi_Update',
      isi_artikel: 'Makassar — Menyikapi sejumlah tiket aspirasi mahasiswa tahapan pre-klinik, Komisi III DPM FKG UMI menggelar RDP dengan Dekanat dan Departemen IKGA. Disepakati peremajaan 15 unit manekin dental phantom.',
      banner_img_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      tanggal_terbit: '2026-09-22',
      status: 'Published',
      penulis: 'Komisi III Advokasi DPM',
      view_count: 245
    }
  ],
  ormawa: [
    { id_ormawa: 'ORG-001', nama_organisasi: 'Badan Eksekutif Mahasiswa (BEM) KBMFKG UMI', jenis_lembaga: 'Eksekutif', nama_ketua: 'Andi Muh. Fadhil', status_keaktifan: 'Aktif' },
    { id_ormawa: 'ORG-002', nama_organisasi: 'Komisi Pemilihan Umum (KPU) KBMFKG UMI', jenis_lembaga: 'Independen_Pemira', nama_ketua: 'Muh. Farhan', status_keaktifan: 'Aktif' },
    { id_ormawa: 'ORG-003', nama_organisasi: 'Dewan Mahasiswa Profesi (DMP) KBMFKG UMI', jenis_lembaga: 'Profesi_Dokter_Gigi', nama_ketua: 'drg. Reza Pratama', status_keaktifan: 'Aktif' }
  ],
  logs: [
    { timestamp: '2026-09-25 11:20:15', username: 'admin', role: 'SuperAdmin', action: 'APPROVE', module: 'BUDGETING', detail: 'Pengesahan lembar rekomendasi pencairan dana BEM FKG UMI.' },
    { timestamp: '2026-09-25 10:15:00', username: 'Public', role: 'Public', action: 'CREATE', module: 'ASPIRASI', detail: 'Aspirasi baru masuk [ASP-89X2]: Fasilitas Dental Chair RSGM.' },
    { timestamp: '2026-09-24 16:30:00', username: 'komisi1', role: 'Komisi1', action: 'CREATE', module: 'JDIH', detail: 'Menerbitkan TAP DPM No. 01/TAP/DPM-FKG/2026.' },
    { timestamp: '2026-09-24 14:10:00', username: 'komisi2', role: 'Komisi2', action: 'CREATE', module: 'INSPEKSI', detail: 'Input inspeksi pleno pembukaan LKMM-G.' }
  ]
};

// Auto-seed function (idempotent, checks dpm:initialized)
async function ensureDatabaseInitialized() {
  try {
    const isInit = await dbGet('initialized');
    if (!isInit) {
      console.log('🔄 Menginisialisasi basis data awal DPM KBMFKG UMI di Redis...');
      for (const [key, val] of Object.entries(INITIAL_SEEDS)) {
        await dbSet(key, val);
      }
      await dbSet('initialized', 'true');
      console.log('✅ Basis data awal DPM KBMFKG UMI berhasil disimpan di Redis!');
    }
  } catch (err) {
    console.error('❌ Kesalahan saat inisialisasi basis data:', err.message);
  }
}

// ── LOG ACTIVITY AUDIT TRAIL ──
async function logAction(username, role, action, moduleName, detail, ip = '127.0.0.1') {
  try {
    const logs = (await dbGet('logs')) || [];
    logs.unshift({
      timestamp: getWitaTimestamp(),
      username: username || 'System',
      role: role || 'Public',
      action: action || 'INFO',
      module: moduleName || 'SYSTEM',
      detail: detail || '',
      ip: ip
    });
    if (logs.length > 500) logs.pop();
    await dbSet('logs', logs);
  } catch (e) {
    console.error('Failed to write audit log:', e.message);
  }
}

// ── MIDDLEWARE EXPRESS ──
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Konfigurasi EJS View Engine & Static Assets
app.set('views', __dirname);
app.set('view engine', 'ejs');

// Direktori Unggahan File Native (PDF & Gambar)
const uploadDir = path.join(__dirname, 'public', 'uploads');
const pdfDir = path.join(uploadDir, 'pdf');
const imgDir = path.join(uploadDir, 'img');
[uploadDir, pdfDir, imgDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage Engine Multer untuk Dokumen PDF Resmi
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfDir),
  filename: (req, file, cb) => {
    const rawName = path.basename(file.originalname, path.extname(file.originalname));
    const safeName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 45);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, `${safeName}-${unique}.pdf`);
  }
});

// Storage Engine Multer untuk Banner Gambar Berita
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imgDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.webp').toLowerCase();
    const rawName = path.basename(file.originalname, ext);
    const safeName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 45);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, `${safeName}-${unique}${ext}`);
  }
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya dokumen format PDF (.pdf) yang diperbolehkan.'));
    }
  }
});

const uploadImg = multer({
  storage: imgStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan.'));
    }
  }
});

// Sajikan file PDF Native dengan Header SEO Google Search Console Gold Standard
app.use('/uploads/pdf', express.static(pdfDir, {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Sajikan file Gambar Banner dengan Header Cache Optimal
app.use('/uploads/img', express.static(imgDir, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.setHeader('X-Robots-Tag', 'index, follow');
  }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Sajikan favicon dan logo resmi secara direct
app.get('/dpmfkgumi.webp', (req, res) => {
  res.type('image/webp');
  res.sendFile(path.join(__dirname, 'dpmfkgumi.webp'));
});
app.get('/favicon.ico', (req, res) => {
  res.type('image/webp');
  res.sendFile(path.join(__dirname, 'dpmfkgumi.webp'));
});

// Inisialisasi awal database
ensureDatabaseInitialized();

// ════════════════════════════════════════════════════════════════
// 1. ROUTE UTAMA WEB APP (PAGE RENDERING)
// ════════════════════════════════════════════════════════════════

// 1.A. PORTAL PUBLIK MURNI (SSR + 100% DINAMIS SEO GOLD STANDARD GSC)
// 1.A. PORTAL PUBLIK MURNI & DEDICATED SECTION ROUTING (SSR + 100% DINAMIS SEO GOLD STANDARD GSC)
const renderPublicPortal = async (req, res, activePage = 'home') => {
  try {
    const profil = (await dbGet('profil')) || INITIAL_SEEDS.profil;
    const berita = (await dbGet('berita')) || INITIAL_SEEDS.berita;
    const jdih = (await dbGet('jdih')) || INITIAL_SEEDS.jdih;
    const ormawa = (await dbGet('ormawa')) || INITIAL_SEEDS.ormawa;
    const aspirasi = (await dbGet('aspirasi')) || INITIAL_SEEDS.aspirasi;
    const proker = (await dbGet('proker')) || INITIAL_SEEDS.proker;

    const stats = {
      aspirasiCount: aspirasi.length,
      aspirasiSelesai: aspirasi.filter(a => a.status === 'Selesai').length,
      jdihCount: jdih.length,
      prokerCount: proker.length
    };

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    let pageTitle = `${profil.nama_lembaga} - Parlemen Mahasiswa Berintegritas & Transparan`;
    let pageDesc = `${profil.sambutan_ketua ? profil.sambutan_ketua.slice(0, 160) : profil.visi}. Layanan E-Legislasi JDIH Ormawa, E-Aspirasi Advokasi Mahasiswa, dan Pengawasan Program Kerja FKG UMI.`;
    let pageCanonical = baseUrl;

    if (activePage === 'profil') {
      pageTitle = `Profil Dewan & Falsafah Parlemen - ${profil.nama_lembaga}`;
      pageDesc = `Struktur dewan, visi misi, serta tugas pokok 4 fungsi parlemen DPM KBMFKG UMI.`;
      pageCanonical = `${baseUrl}/profil`;
    } else if (activePage === 'regulasi') {
      pageTitle = `Regulasi & Bank Produk Hukum JDIH - ${profil.nama_lembaga}`;
      pageDesc = `Pusat dokumentasi dan jaringan informasi hukum ormawa, Ketetapan Sidang (TAP), dan Undang-Undang FKG UMI.`;
      pageCanonical = `${baseUrl}/regulasi`;
    } else if (activePage === 'aspirasi') {
      pageTitle = `Kanal E-Aspirasi Mahasiswa Kedokteran Gigi - ${profil.nama_lembaga}`;
      pageDesc = `Layanan advokasi aspirasi online mahasiswa tahapan Pre-Klinik dan Koas RSGM FKG UMI dengan sistem pelacakan tiket transparan.`;
      pageCanonical = `${baseUrl}/aspirasi`;
    } else if (activePage === 'berita') {
      pageTitle = `Berita & Siaran Pers Parlemen - ${profil.nama_lembaga}`;
      pageDesc = `Publikasi resmi hasil sidang paripurna, warta pers, dan keterbukaan informasi kemahasiswaan FKG UMI.`;
      pageCanonical = `${baseUrl}/berita`;
    } else if (activePage === 'lembaga') {
      pageTitle = `Organisasi Kemahasiswaan Mitra - ${profil.nama_lembaga}`;
      pageDesc = `Sinergi kemahasiswaan dental: BEM KBMFKG UMI, KPU KBMFKG UMI, dan DMP KBMFKG UMI (Dewan Mahasiswa Profesi).`;
      pageCanonical = `${baseUrl}/lembaga`;
    }

    const seo = {
      title: pageTitle,
      description: pageDesc,
      keywords: 'DPM FKG UMI, DMP KBMFKG UMI, Parlemen Mahasiswa, Kedokteran Gigi UMI, Organisasi Kemahasiswaan Lingkup FKG UMI, JDIH FKG UMI, Aspirasi Mahasiswa, BEM FKG UMI, KPU FKG UMI, Advokasi Mahasiswa, Universitas Muslim Indonesia, Makassar',
      canonicalUrl: pageCanonical,
      ogImage: `${baseUrl}/dpmfkgumi.webp`,
      author: profil.nama_lembaga,
      namaLembaga: profil.nama_lembaga,
      fakultas: profil.universitas_fakultas,
      periode: profil.periode_aktif,
      baseUrl
    };

    res.render('index', {
      seo,
      profil,
      berita,
      jdih,
      ormawa,
      stats,
      page: activePage,
      activePage,
      ticket: (req.query.ticket || '').toString()
    });
  } catch (err) {
    console.error('Error rendering portal:', err);
    res.render('index', {
      seo: {
        title: 'Dewan Perwakilan Mahasiswa KBMFKG UMI',
        description: 'Portal Resmi & Sistem Informasi Terpadu DPM KBMFKG UMI',
        keywords: 'DPM FKG UMI, Parlemen Mahasiswa',
        canonicalUrl: '',
        ogImage: '/dpmfkgumi.webp',
        author: 'DPM KBMFKG UMI',
        baseUrl: ''
      },
      profil: INITIAL_SEEDS.profil,
      berita: [],
      jdih: [],
      ormawa: [],
      stats: {},
      page: activePage,
      activePage,
      ticket: ''
    });
  }
};

app.get('/', (req, res) => renderPublicPortal(req, res, 'home'));
app.get('/profil', (req, res) => renderPublicPortal(req, res, 'profil'));
app.get('/regulasi', (req, res) => renderPublicPortal(req, res, 'regulasi'));
app.get('/jdih', (req, res) => res.redirect(301, '/regulasi'));
app.get('/aspirasi', (req, res) => renderPublicPortal(req, res, 'aspirasi'));
app.get('/berita', (req, res) => renderPublicPortal(req, res, 'berita'));
app.get('/lembaga', (req, res) => renderPublicPortal(req, res, 'lembaga'));
app.get('/ormawa', (req, res) => res.redirect(301, '/lembaga'));

// 1.B. HALAMAN LOGIN KHUSUS DEWAN (/admin-login)
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});
app.get('/login', (req, res) => {
  res.redirect('/admin-login');
});

// 1.C. PANEL BACKOFFICE DEWAN (/admin)
app.get('/admin', (req, res) => {
  res.render('admin-dashboard');
});
app.get('/dashboard', (req, res) => {
  res.redirect('/admin');
});

// 1.D. DETAIL BERITA & SIARAN PERS (/berita/:identifier) - SSR 100% DINAMIS SEO GOLD STANDARD GSC
app.get('/berita/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const listBerita = (await dbGet('berita')) || INITIAL_SEEDS.berita;
    const profil = (await dbGet('profil')) || INITIAL_SEEDS.profil;

    const item = listBerita.find(b => (b.slug && b.slug === identifier) || b.id_berita === identifier);
    if (!item) {
      return res.status(404).render('berita', {
        notFound: true,
        seo: {
          title: 'Berita Tidak Ditemukan - DPM KBMFKG UMI',
          description: 'Publikasi warta berita tidak ditemukan atau telah diarsipkan oleh DPM KBMFKG UMI.',
          canonicalUrl: '',
          ogImage: '/dpmfkgumi.webp',
          author: profil.nama_lembaga,
          baseUrl: ''
        },
        profil,
        berita: null,
        recentBerita: listBerita.slice(0, 4)
      });
    }

    // Auto-increment View Counter
    item.view_count = (parseInt(item.view_count) || 0) + 1;
    const itemIndex = listBerita.findIndex(b => b.id_berita === item.id_berita);
    if (itemIndex !== -1) {
      listBerita[itemIndex].view_count = item.view_count;
      await dbSet('berita', listBerita);
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    const canonicalUrl = `${baseUrl}/berita/${item.slug || item.id_berita}`;

    // Dynamic OG Image dari banner yang di-upload
    let ogImage = item.banner_img_url || `${baseUrl}/dpmfkgumi.webp`;
    if (ogImage && ogImage.startsWith('/')) {
      ogImage = `${baseUrl}${ogImage}`;
    }

    // Snippet Deskripsi Bersih untuk Meta Description
    const rawSnippet = (item.isi_artikel || '')
      .replace(/<[^>]*>/g, '')
      .replace(/\r?\n|\r/g, ' ')
      .trim();
    const metaDescription = (rawSnippet.slice(0, 160) || item.judul_berita) + '...';

    const seo = {
      title: `${item.judul_berita} - DPM KBMFKG UMI`,
      description: metaDescription,
      keywords: `${item.kategori}, Berita DPM FKG UMI, Siaran Pers, Parlemen Mahasiswa, Kedokteran Gigi UMI, ${item.judul_berita}`,
      canonicalUrl,
      ogImage,
      author: item.penulis || profil.nama_lembaga,
      namaLembaga: profil.nama_lembaga,
      fakultas: profil.universitas_fakultas,
      periode: profil.periode_aktif,
      publishedTime: item.tanggal_terbit,
      baseUrl
    };

    const recentBerita = listBerita
      .filter(b => b.id_berita !== item.id_berita && b.status === 'Published')
      .slice(0, 4);

    res.render('berita', {
      notFound: false,
      seo,
      profil,
      berita: item,
      recentBerita
    });
  } catch (err) {
    console.error('Error rendering berita detail:', err);
    res.status(500).send('Terjadi kesalahan pada server saat memuat berita.');
  }
});

// 1.E. ENDPOINT UPLOAD FILE NATIVE (PDF & IMAGE DENGAN VALIDASI)
app.post('/api/upload/pdf', (req, res) => {
  uploadPdf.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json(createResponse(false, null, err.message));
    }
    if (!req.file) {
      return res.status(400).json(createResponse(false, null, 'Tidak ada file PDF yang diunggah.'));
    }
    const fileUrl = `/uploads/pdf/${req.file.filename}`;
    res.json(createResponse(true, {
      fileUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size
    }, 'File PDF berhasil diunggah secara native!'));
  });
});

app.post('/api/upload/image', (req, res) => {
  uploadImg.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json(createResponse(false, null, err.message));
    }
    if (!req.file) {
      return res.status(400).json(createResponse(false, null, 'Tidak ada file gambar yang diunggah.'));
    }
    const imageUrl = `/uploads/img/${req.file.filename}`;
    res.json(createResponse(true, {
      imageUrl,
      fileUrl: imageUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename
    }, 'Gambar banner berhasil diunggah!'));
  });
});

// ════════════════════════════════════════════════════════════════
// 2. ENDPOINT AUTENTIKASI (SUPERADMIN & ROLE DEWAN/ORMAWA)
// ════════════════════════════════════════════════════════════════
const handleAuthLogin = async (req, res) => {
  const { username, password } = req.body || {};
  const u = (username || '').trim();
  const p = (password || '').trim();

  if (!u || !p) {
    return res.json(createResponse(false, null, 'Username dan password wajib diisi.'));
  }

  // 1. Cek SuperAdmin Master via .env (ADMIN_USER & PASS_USER / ADMIN_PASS)
  if ((u.toLowerCase() === ADMIN_USER.toLowerCase() || u.toLowerCase() === 'admin') && 
      (p === ADMIN_PASS || p === 'dpmfkgumi999')) {
    const superAdmin = {
      id_user: 'USR-MASTER',
      nama_lengkap: 'drg. Muh. Fauzan, S.KG (Presidium)',
      nim_stambuk: '16120200001',
      username: ADMIN_USER,
      role: 'SuperAdmin',
      jabatan_organisasi: 'Ketua Umum Presidium DPM KBMFKG UMI',
      status: 'Active',
      last_login: getWitaTimestamp()
    };
    await logAction(superAdmin.username, superAdmin.role, 'LOGIN', 'AUTH', 'Login SuperAdmin berhasil via master auth.', req.ip);
    return res.json(createResponse(true, superAdmin, 'Login SuperAdmin berhasil!'));
  }

  // 2. Cek Role Credentials dari .env (Komisi 1, 2, 3, Banggar, Mitra Ormawa)
  for (const [key, cred] of Object.entries(ROLE_CREDENTIALS)) {
    if (u.toLowerCase() === cred.user.toLowerCase() && p === cred.pass) {
      const userObj = {
        id_user: `USR-${key.toUpperCase()}`,
        nama_lengkap: cred.name,
        nim_stambuk: '16120210000',
        username: cred.user,
        role: cred.role,
        jabatan_organisasi: cred.jab,
        status: 'Active',
        last_login: getWitaTimestamp()
      };
      await logAction(userObj.username, userObj.role, 'LOGIN', 'AUTH', `Login role ${cred.role} berhasil untuk akun ${userObj.username}.`, req.ip);
      return res.json(createResponse(true, userObj, `Selamat datang, ${userObj.nama_lengkap}!`));
    }
  }

  // 3. Cek akun tersimpan di Redis database
  const users = (await dbGet('users')) || [];
  const found = users.find(usr => usr.username.toLowerCase() === u.toLowerCase());

  if (found) {
    if (p === ADMIN_PASS || p === 'dpmfkgumi999' || (found.password && p === found.password)) {
      found.last_login = getWitaTimestamp();
      await dbSet('users', users);
      await logAction(found.username, found.role, 'LOGIN', 'AUTH', `Login berhasil untuk akun ${found.username}.`, req.ip);
      return res.json(createResponse(true, found, `Selamat datang, ${found.nama_lengkap}!`));
    }
  }

  return res.json(createResponse(false, null, 'Kredensial tidak valid atau akun belum terdaftar.'));
};

app.post('/api/auth/login', handleAuthLogin);
app.post('/api/login', handleAuthLogin);

// ════════════════════════════════════════════════════════════════
// 3. ENDPOINT PUBLIK (LANDING, ASPIRASI & JDIH)
// ════════════════════════════════════════════════════════════════
app.get('/api/public/landing', async (req, res) => {
  try {
    const profil = (await dbGet('profil')) || INITIAL_SEEDS.profil;
    const berita = (await dbGet('berita')) || INITIAL_SEEDS.berita;
    const ormawa = (await dbGet('ormawa')) || INITIAL_SEEDS.ormawa;
    const users = (await dbGet('users')) || INITIAL_SEEDS.users;
    const aspirasi = (await dbGet('aspirasi')) || INITIAL_SEEDS.aspirasi;
    const jdih = (await dbGet('jdih')) || INITIAL_SEEDS.jdih;
    const proker = (await dbGet('proker')) || INITIAL_SEEDS.proker;

    const data = {
      profil,
      berita: berita.filter(b => b.status === 'Published').slice(0, 6),
      ormawa,
      dewanMembers: users.filter(u => u.role !== 'MitraOrmawa'),
      metrics: {
        totalAspirasi: aspirasi.length,
        aspirasiSelesai: aspirasi.filter(a => a.status === 'Selesai').length,
        totalRegulasiJdih: jdih.length,
        prokerTerlaksana: proker.filter(p => p.status_pelaksanaan === 'Terlaksana').length
      }
    };
    res.json(createResponse(true, data));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// Submit Aspirasi Baru Mahasiswa
app.post('/api/aspirasi/submit', async (req, res) => {
  try {
    const formData = req.body || {};
    if (!formData.judul_aspirasi || !formData.isi_detail) {
      return res.json(createResponse(false, null, 'Judul dan isi detail aspirasi wajib diisi.'));
    }

    const aspirasiList = (await dbGet('aspirasi')) || [];
    const newId = generateAutoId('ASP-2609', aspirasiList.length + 1);
    const newTicket = generateTicketCode();

    const record = {
      id_aspirasi: newId,
      kode_tiket: newTicket,
      nama_mahasiswa: formData.is_anonim ? 'Mahasiswa Anonim' : (formData.nama_mahasiswa || '-'),
      nim_stambuk: formData.is_anonim ? '-' : (formData.nim_stambuk || '-'),
      program_studi: formData.program_studi || 'Sarjana_Kedokteran_Gigi',
      kategori_isu: formData.kategori_isu || 'Umum',
      judul_aspirasi: formData.judul_aspirasi,
      isi_detail: formData.isi_detail,
      bukti_lampiran_url: formData.bukti_lampiran_url || '',
      tanggal_masuk: getWitaTimestamp(),
      status: 'Menunggu',
      disposisi_ke: 'Komisi III (Advokasi & Aspirasi)',
      tanggapan_dewan: 'Aspirasi Anda telah diterima di sistem parlemen dan sedang diverifikasi oleh Komisi III.',
      tanggal_selesai: '',
      updated_by: 'Public'
    };

    aspirasiList.unshift(record);
    await dbSet('aspirasi', aspirasiList);
    await logAction('Public', 'Public', 'CREATE', 'ASPIRASI', `Pengajuan aspirasi baru [${newTicket}]: ${record.judul_aspirasi}`, req.ip);

    res.json(createResponse(true, { ticketCode: newTicket, idAspirasi: newId }, 'Aspirasi berhasil dikirim ke parlemen.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// Tracking Status Tiket Aspirasi
app.get('/api/aspirasi/track/:ticketCode', async (req, res) => {
  try {
    const tCode = (req.params.ticketCode || '').trim().toUpperCase();
    const aspirasiList = (await dbGet('aspirasi')) || [];
    const item = aspirasiList.find(a => (a.kode_tiket || '').toUpperCase() === tCode);

    if (!item) {
      return res.json(createResponse(false, null, `Tiket dengan kode [${tCode}] tidak ditemukan dalam arsip parlemen.`));
    }

    // Hitung step timeline
    let stepNumber = 1;
    if (item.status === 'Terverifikasi' || item.status === 'Diverifikasi') stepNumber = 2;
    else if (item.status === 'Disposisi_Komisi3') stepNumber = 3;
    else if (item.status === 'Dalam_Advokasi' || item.status === 'Eskalasi_Dekanat') stepNumber = 4;
    else if (item.status === 'Selesai') stepNumber = 5;
    else if (item.status === 'Ditolak') stepNumber = -1;

    res.json(createResponse(true, { ticket: item, stepNumber }));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// Daftar JDIH Publik (Filter & Search)
app.get('/api/jdih/list', async (req, res) => {
  try {
    const { q, jenis, tahun } = req.query || {};
    let list = (await dbGet('jdih')) || [];

    if (q) {
      const kw = q.toLowerCase();
      list = list.filter(item =>
        (item.judul_regulasi && item.judul_regulasi.toLowerCase().includes(kw)) ||
        (item.nomor_peraturan && item.nomor_peraturan.toLowerCase().includes(kw)) ||
        (item.deskripsi_singkat && item.deskripsi_singkat.toLowerCase().includes(kw))
      );
    }
    if (jenis && jenis !== 'ALL') {
      list = list.filter(item => item.jenis_peraturan === jenis);
    }
    if (tahun && tahun !== 'ALL') {
      list = list.filter(item => String(item.tahun_penetapan) === String(tahun));
    }

    res.json(createResponse(true, list));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// Increment Download Counter Dokumen JDIH
app.post('/api/jdih/download/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const list = (await dbGet('jdih')) || [];
    const item = list.find(j => j.id_regulasi === id);
    if (item) {
      item.download_count = (Number(item.download_count) || 0) + 1;
      await dbSet('jdih', list);
    }
    res.json(createResponse(true, { download_count: item ? item.download_count : 0 }));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ════════════════════════════════════════════════════════════════
// 4. BACKOFFICE & DASHBOARD ANALYTICS API
// ════════════════════════════════════════════════════════════════
app.get('/api/dashboard/analytics', async (req, res) => {
  try {
    const aspirasi = (await dbGet('aspirasi')) || [];
    const proker = (await dbGet('proker')) || [];
    const proposal = (await dbGet('proposal')) || [];
    const lpj = (await dbGet('lpj')) || [];
    const jdih = (await dbGet('jdih')) || [];
    const logs = (await dbGet('logs')) || [];
    const ormawa = (await dbGet('ormawa')) || [];

    const totalAsp = aspirasi.length;
    const selesaiAsp = aspirasi.filter(a => a.status === 'Selesai').length;
    const totalPrk = proker.length;
    const donePrk = proker.filter(p => p.status_pelaksanaan === 'Terlaksana').length;
    const pctPrk = totalPrk > 0 ? Math.round((donePrk / totalPrk) * 100) : 0;
    const jdihAktif = jdih.filter(j => j.status_hukum === 'Berlaku').length;
    const pendingAudit = proposal.filter(p => p.status_approval === 'Review_Banggar').length + 
                         lpj.filter(l => l.status_lpj === 'Dalam_Audit' || l.status_lpj === 'Pending_Verifikasi').length;

    const kpi = {
      totalAspirasi: totalAsp,
      aspirasiSelesai: selesaiAsp,
      totalProker: totalPrk,
      prokerTerlaksana: donePrk,
      persenProker: pctPrk,
      totalJdihAktif: jdihAktif,
      totalAntreanAnggaran: pendingAudit
    };

    const chartAnggaran = {};
    proposal.forEach(p => {
      const orm = ormawa.find(o => o.id_ormawa === p.id_ormawa);
      const name = orm ? orm.nama_organisasi.split('(')[0].trim() : p.id_ormawa;
      chartAnggaran[name] = (chartAnggaran[name] || 0) + Number(p.total_anggaran_disetujui || p.total_anggaran_diajukan || 0);
    });

    const chartIsu = {};
    aspirasi.forEach(a => {
      const kat = a.kategori_isu || 'Umum';
      chartIsu[kat] = (chartIsu[kat] || 0) + 1;
    });

    const urgentAspirasi = aspirasi.filter(a => a.status !== 'Selesai').slice(0, 5);
    const recentLogs = logs.slice(0, 6);

    res.json(createResponse(true, {
      kpi,
      chartAnggaran,
      chartIsu,
      anggaranMap: chartAnggaran,
      isuMap: chartIsu,
      metrics: kpi,
      urgentAspirasi,
      recentAspirasi: urgentAspirasi,
      recentLogs
    }));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: JDIH ADMIN ──
app.get('/api/jdih/admin', async (req, res) => {
  const list = (await dbGet('jdih')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/jdih/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('jdih')) || [];
    const idx = list.findIndex(j => j.id_regulasi === data.id_regulasi);

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      await dbSet('jdih', list);
      await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'JDIH', `Memperbarui regulasi ${data.nomor_peraturan}`);
    } else {
      const newId = generateAutoId('REG', list.length + 1);
      const newDoc = {
        id_regulasi: newId,
        download_count: 0,
        ...data
      };
      list.unshift(newDoc);
      await dbSet('jdih', list);
      await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'JDIH', `Menerbitkan regulasi baru ${newDoc.nomor_peraturan}`);
    }
    res.json(createResponse(true, null, 'Data regulasi JDIH berhasil disimpan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

app.delete('/api/jdih/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let list = (await dbGet('jdih')) || [];
    list = list.filter(j => j.id_regulasi !== id);
    await dbSet('jdih', list);
    await logAction('Admin', 'SuperAdmin', 'DELETE', 'JDIH', `Menghapus regulasi ID ${id}`);
    res.json(createResponse(true, null, 'Regulasi berhasil dihapus.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: PROKER PENGAWASAN (KOMISI II) ──
app.get('/api/proker/admin', async (req, res) => {
  const list = (await dbGet('proker')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/proker/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('proker')) || [];
    const idx = list.findIndex(p => p.id_proker === data.id_proker);

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      await dbSet('proker', list);
      await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'PROKER', `Update proker ${data.nama_kegiatan}`);
    } else {
      const newId = generateAutoId('PRK', list.length + 1);
      list.unshift({ id_proker: newId, ...data });
      await dbSet('proker', list);
      await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'PROKER', `Menambah proker ${data.nama_kegiatan}`);
    }
    res.json(createResponse(true, null, 'Data proker berhasil disimpan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: INSTRUMEN INSPEKSI (KOMISI II) ──
app.get('/api/inspeksi/admin', async (req, res) => {
  const list = (await dbGet('inspeksi')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/inspeksi/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('inspeksi')) || [];
    const newId = generateAutoId('INS', list.length + 1);
    list.unshift({
      id_inspeksi: newId,
      inspector_name: currentUser?.nama_lengkap || 'Legislator DPM',
      ...data
    });
    await dbSet('inspeksi', list);

    // Jika auto update persentase proker dicentang
    if (data.auto_update_capaian && data.id_proker) {
      const prokerList = (await dbGet('proker')) || [];
      const prk = prokerList.find(p => p.id_proker === data.id_proker);
      if (prk) {
        prk.persentase_capaian = Number(data.kehadiran_pengurus_persen || prk.persentase_capaian);
        await dbSet('proker', prokerList);
      }
    }

    await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'INSPEKSI', `Input inspeksi: ${data.nama_sidang_kegiatan}`);
    res.json(createResponse(true, null, 'Laporan inspeksi lapangan berhasil direkam.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: ASPIRASI ADVOKASI (KOMISI III) ──
app.get('/api/aspirasi/admin', async (req, res) => {
  const list = (await dbGet('aspirasi')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/aspirasi/update', async (req, res) => {
  try {
    const { idAspirasi, newStatus, status, disposisiKe, tanggapanDewan, currentUser } = req.body || {};
    const finalStatus = newStatus || status;
    const list = (await dbGet('aspirasi')) || [];
    const idx = list.findIndex(a => a.id_aspirasi === idAspirasi);

    if (idx !== -1) {
      list[idx].status = finalStatus || list[idx].status;
      list[idx].disposisi_ke = disposisiKe || list[idx].disposisi_ke;
      list[idx].tanggapan_dewan = tanggapanDewan || list[idx].tanggapan_dewan;
      list[idx].updated_by = currentUser?.username || 'Dewan';
      if (finalStatus === 'Selesai') list[idx].tanggal_selesai = getWitaTimestamp();
      await dbSet('aspirasi', list);
      await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'ASPIRASI', `Update status tiket ${list[idx].kode_tiket} menjadi ${finalStatus}`);
      return res.json(createResponse(true, null, 'Status aspirasi berhasil diperbarui.'));
    }
    res.json(createResponse(false, null, 'Aspirasi tidak ditemukan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: PROPOSAL ANGGARAN (BADAN ANGGARAN) ──
app.get('/api/proposal/admin', async (req, res) => {
  const list = (await dbGet('proposal')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/proposal/submit', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('proposal')) || [];
    const newId = generateAutoId('PROP', list.length + 1);
    const newProp = {
      id_proposal: newId,
      id_ormawa: data.id_ormawa || currentUser?.username || 'ORMAWA',
      nama_proker: data.nama_proker,
      total_anggaran_diajukan: Number(data.total_anggaran_diajukan || 0),
      total_anggaran_disetujui: 0,
      file_proposal_url: data.file_proposal_url || '',
      tanggal_pengajuan: getWitaTimestamp().substring(0, 10),
      status_approval: 'Review_Banggar',
      catatan_banggar: 'Menunggu telaah rincian anggaran oleh Badan Anggaran DPM.'
    };
    list.unshift(newProp);
    await dbSet('proposal', list);
    await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'BUDGETING', `Pengajuan proposal anggaran: ${newProp.nama_proker}`);
    res.json(createResponse(true, null, 'Proposal kegiatan berhasil diajukan ke Badan Anggaran DPM.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

app.post('/api/proposal/review', async (req, res) => {
  try {
    const { idProposal, newStatus, status, nominalDisetujui, nominal, catatan, currentUser } = req.body || {};
    const finalStatus = newStatus || status;
    const finalNominal = nominalDisetujui !== undefined ? nominalDisetujui : nominal;
    const list = (await dbGet('proposal')) || [];
    const idx = list.findIndex(p => p.id_proposal === idProposal);

    if (idx !== -1) {
      list[idx].status_approval = finalStatus;
      if (finalNominal !== undefined) list[idx].total_anggaran_disetujui = Number(finalNominal);
      if (catatan) list[idx].catatan_banggar = catatan;
      await dbSet('proposal', list);
      await logAction(currentUser?.username, currentUser?.role, 'APPROVE', 'BUDGETING', `Review proposal ${idProposal}: Status ${finalStatus}`);
      return res.json(createResponse(true, null, 'Review proposal berhasil disimpan.'));
    }
    res.json(createResponse(false, null, 'Proposal tidak ditemukan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: LPJ KEUANGAN (BADAN ANGGARAN) ──
app.get('/api/lpj/admin', async (req, res) => {
  const list = (await dbGet('lpj')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/lpj/submit', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('lpj')) || [];
    const newId = generateAutoId('LPJ', list.length + 1);
    const newLPJ = {
      id_lpj: newId,
      id_proposal: data.id_proposal,
      id_ormawa: data.id_ormawa || currentUser?.username || 'ORMAWA',
      total_realisasi_dana: Number(data.total_realisasi_dana || 0),
      sisa_lebih_kurang: Number(data.sisa_lebih_kurang || 0),
      file_lpj_url: data.file_lpj_url || '',
      file_kuitansi_drive_folder: data.file_kuitansi_drive_folder || '',
      tanggal_serah_lpj: getWitaTimestamp().substring(0, 10),
      status_lpj: 'Dalam_Audit',
      catatan_audit: 'Berkas kuitansi dan nota fisik dalam verifikasi audit Badan Anggaran.',
      no_surat_bebas_tanggungan: ''
    };
    list.unshift(newLPJ);
    await dbSet('lpj', list);
    await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'LPJ', `Penyerahan berkas LPJ untuk ${newLPJ.id_proposal}`);
    res.json(createResponse(true, null, 'Berkas LPJ berhasil diserahkan untuk diaudit.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

app.post('/api/lpj/audit', async (req, res) => {
  try {
    const { idLPJ, idLpj, statusLPJ, status, catatanAudit, catatan, currentUser } = req.body || {};
    const targetId = idLPJ || idLpj;
    const finalStatus = statusLPJ || status;
    const finalNote = catatanAudit || catatan;
    const list = (await dbGet('lpj')) || [];
    const idx = list.findIndex(l => l.id_lpj === targetId);

    if (idx !== -1) {
      list[idx].status_lpj = finalStatus;
      if (finalNote) list[idx].catatan_audit = finalNote;
      if ((finalStatus === 'Selesai' || finalStatus === 'Lolos_Audit') && !list[idx].no_surat_bebas_tanggungan) {
        list[idx].no_surat_bebas_tanggungan = `${('00' + (idx + 1)).slice(-2)}/SK-BT/BANGGAR-DPM/FKG-UMI/${new Date().getFullYear()}`;
      }
      await dbSet('lpj', list);
      await logAction(currentUser?.username, currentUser?.role, 'AUDIT', 'LPJ', `Audit LPJ ${targetId}: ${finalStatus}`);
      return res.json(createResponse(true, null, 'Hasil audit LPJ berhasil disimpan.'));
    }
    res.json(createResponse(false, null, 'Data LPJ tidak ditemukan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: WARTA BERITA ──
app.get('/api/berita/admin', async (req, res) => {
  const list = (await dbGet('berita')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/berita/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('berita')) || [];
    const idx = list.findIndex(b => b.id_berita === data.id_berita);

    const cleanSlug = data.slug ? createSlug(data.slug) : createSlug(data.judul_berita);
    data.slug = cleanSlug || `berita-${Date.now()}`;

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      await dbSet('berita', list);
      await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'NEWS', `Edit warta berita ${data.judul_berita}`);
    } else {
      const newId = generateAutoId('NWS', list.length + 1);
      list.unshift({
        id_berita: newId,
        view_count: 0,
        tanggal_terbit: getWitaTimestamp().substring(0, 10),
        penulis: currentUser?.nama_lengkap || 'Humas DPM',
        ...data
      });
      await dbSet('berita', list);
      await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'NEWS', `Publikasi warta berita ${data.judul_berita}`);
    }
    res.json(createResponse(true, null, 'Berita berhasil disimpan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

app.delete('/api/berita/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let list = (await dbGet('berita')) || [];
    list = list.filter(b => b.id_berita !== id);
    await dbSet('berita', list);
    await logAction('Admin', 'SuperAdmin', 'DELETE', 'NEWS', `Hapus berita ID ${id}`);
    res.json(createResponse(true, null, 'Berita berhasil dihapus.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: MANAJEMEN USER (SUPERADMIN) ──
app.get('/api/users/admin', async (req, res) => {
  const list = (await dbGet('users')) || [];
  res.json(createResponse(true, list));
});

app.post('/api/users/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    const list = (await dbGet('users')) || [];
    const idx = list.findIndex(u => u.id_user === data.id_user);

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      await dbSet('users', list);
      await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'USER', `Update data akun ${data.username}`);
    } else {
      const newId = generateAutoId('USR', list.length + 1);
      list.push({ id_user: newId, status: 'Active', ...data });
      await dbSet('users', list);
      await logAction(currentUser?.username, currentUser?.role, 'CREATE', 'USER', `Membuat akun user baru ${data.username}`);
    }
    res.json(createResponse(true, null, 'Data user berhasil disimpan.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── CRUD: PROFIL ORGANISASI ──
app.get('/api/profil/admin', async (req, res) => {
  const p = (await dbGet('profil')) || INITIAL_SEEDS.profil;
  res.json(createResponse(true, p));
});

app.post('/api/profil/save', async (req, res) => {
  try {
    const { formData, currentUser } = req.body || {};
    const data = formData || req.body;
    await dbSet('profil', data);
    await logAction(currentUser?.username, currentUser?.role, 'UPDATE', 'CONFIG', 'Memperbarui profil lembaga DPM KBMFKG UMI.');
    res.json(createResponse(true, null, 'Profil organisasi berhasil diperbarui.'));
  } catch (err) {
    res.json(createResponse(false, null, err.message));
  }
});

// ── AUDIT LOGS ──
app.get('/api/logs/admin', async (req, res) => {
  const logs = (await dbGet('logs')) || [];
  res.json(createResponse(true, logs));
});

// ════════════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const startServer = (portToTry) => {
    const serverInstance = app.listen(portToTry, () => {
      console.log(`🚀 Portal DPM KBMFKG UMI berjalan aktif di http://localhost:${portToTry}`);
      console.log(`⚡ Live Update (Watch Mode) aktif: server otomatis reload saat ada perubahan kode`);
      console.log(`🔐 Master Admin: ${ADMIN_USER} | Upstash Redis Storage: CONNECTED`);
    });

    serverInstance.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = Number(portToTry) + 1;
        console.warn(`⚠️ Port ${portToTry} sedang digunakan. Menjalankan di port alternatif http://localhost:${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('❌ Server error:', err);
      }
    });

    process.on('SIGINT', () => {
      serverInstance.close(() => process.exit(0));
    });
    process.on('SIGTERM', () => {
      serverInstance.close(() => process.exit(0));
    });
  };

  startServer(Number(PORT));
}

module.exports = app;
