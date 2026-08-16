const express = require('express');
const path = require('path');
const app = express();

// Konfigurasi EJS & Direktori Statis
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dpmfkgumi.vercel.app';

// ==========================================
// 🚀 UPSTASH REDIS CACHE LAYER (VERCEL KV)
// ==========================================
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function getCache(key) {
    if (!KV_URL || !KV_TOKEN) return null;
    try {
        const response = await fetch(`${KV_URL}/get/${key}`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();
        return data.result ? JSON.parse(data.result) : null;
    } catch (error) {
        console.error('Redis Get Error:', error.message);
        return null;
    }
}

async function setCache(key, value, ttl = 3600) {
    if (!KV_URL || !KV_TOKEN) return;
    try {
        await fetch(`${KV_URL}/set/${key}?EX=${ttl}`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${KV_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(value))
        });
    } catch (error) {
        console.error('Redis Set Error:', error.message);
    }
}

// ==========================================
// 🗄️ MOCK DATABASE (DIPERBARUI DENGAN SLUG)
// ==========================================
const getDatabase = async () => {
    // 1. Cek Cache Redis
    const cachedDB = await getCache('dpm_database_v1');
    if (cachedDB) return cachedDB;

    // 2. Fallback Database
    const DB = {
        organization: {
            name: "DPM KBMFKG UMI",
            tagline: "Satu Platform, Satu Informasi, Satu Jejak Organisasi.",
            description: "Dewan Perwakilan Mahasiswa Keluarga Besar Mahasiswa Fakultas Kedokteran Gigi Universitas Muslim Indonesia adalah lembaga legislatif tertinggi di tingkat fakultas.",
            vision: "Menjadi lembaga legislatif yang aspiratif, transparan, dan bersinergi dalam mewujudkan KBMFKG UMI yang progresif.",
            mission: [
                "Menyerap dan mengawal aspirasi mahasiswa FKG UMI.",
                "Melaksanakan fungsi pengawasan terhadap lembaga eksekutif.",
                "Meningkatkan kapasitas dan kapabilitas anggota."
            ]
        },
        periods: [
            { id: 'p1', name: 'Periode 2024/2025', status: 'ARCHIVED' },
            { id: 'p2', name: 'Periode 2025/2026', status: 'ACTIVE' }
        ],
        news: [
            { id: 'n1', slug: 'sidang-umum-kbmfkg-umi-ke-xv', title: 'Sidang Umum KBMFKG UMI Ke-XV Berlangsung Sukses', date: '2025-08-10', excerpt: 'Sidang umum menetapkan garis besar haluan organisasi untuk satu periode ke depan.', image: 'https://placehold.co/600x400/1e293b/22c55e?text=Sidang+Umum', status: 'PUBLISHED' },
            { id: 'n2', slug: 'jaring-aspirasi-mahasiswa-2024', title: 'Jaring Aspirasi Mahasiswa (JARA) Angkatan 2024', date: '2025-08-14', excerpt: 'DPM KBMFKG UMI turun langsung mendengarkan keluhan dan masukan dari mahasiswa baru.', image: 'https://placehold.co/600x400/1e293b/3b82f6?text=Jaring+Aspirasi', status: 'PUBLISHED' },
        ],
        programs: [
            { id: 'pr1', slug: 'legislative-class', name: 'Legislative Class', status: 'ONGOING', description: 'Pelatihan dasar-dasar legislasi, persidangan, dan administrasi.', target: 'Seluruh Anggota KBMFKG' },
            { id: 'pr2', slug: 'jaring-aspirasi-jara', name: 'Jaring Aspirasi (JARA)', status: 'COMPLETED', description: 'Pengumpulan aspirasi dari setiap angkatan aktif.', target: 'Mahasiswa FKG UMI' },
            { id: 'pr3', slug: 'audit-keuangan-bem', name: 'Audit Keuangan BEM', status: 'PLANNED', description: 'Pemeriksaan laporan pertanggungjawaban keuangan tengah tahun.', target: 'BEM KBMFKG UMI' },
        ],
        events: [
            { id: 'e1', slug: 'rakernas-ismkmi-2025', title: 'Rapat Kerja Nasional ISMKMI', date: '2025-09-01', location: 'Jakarta' },
            { id: 'e2', slug: 'evaluasi-triwulan-i', title: 'Evaluasi Triwulan I', date: '2025-09-15', location: 'Ruang Senat FKG UMI' }
        ],
        team: [
            { id: 't1', name: 'M. Aksa Arsyad., drg., S.KG', position: 'Dewan Penasihat', image: '/css/axaprofil.png' }
        ]
    };

    // 3. Set Cache
    await setCache('dpm_database_v1', DB, 3600); // Cache 1 Jam
    return DB;
};

// ==========================================
// 🌐 ROUTING DENGAN DYNAMIC SEO & JSON-LD
// ==========================================
app.use(async (req, res, next) => {
    res.locals.DB = await getDatabase();
    res.locals.path = req.path;
    res.locals.baseUrl = BASE_URL;
    next();
});

// 1. BERANDA
app.get('/', (req, res) => {
    const DB = res.locals.DB;
    const seo = {
        title: `Beranda | ${DB.organization.name}`,
        description: DB.organization.description,
        canonical: `${BASE_URL}/`,
        ogImage: `${BASE_URL}/img/logo-dpm.png`,
        type: "website",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": DB.organization.name,
            "url": BASE_URL,
            "logo": `${BASE_URL}/img/logo-dpm.png`,
            "description": DB.organization.description,
            "slogan": DB.organization.tagline
        }
    };
    res.render('index', { seo });
});

// 2. TENTANG KAMI
app.get('/tentang', (req, res) => {
    const DB = res.locals.DB;
    const seo = {
        title: `Tentang Organisasi | ${DB.organization.name}`,
        description: `Pelajari sejarah, visi, dan misi ${DB.organization.name} dalam mewujudkan lembaga legislatif yang aspiratif dan progresif.`,
        canonical: `${BASE_URL}/tentang`,
        ogImage: `${BASE_URL}/img/logo-dpm.png`,
        type: "article",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": `Tentang ${DB.organization.name}`,
            "description": DB.organization.description,
            "url": `${BASE_URL}/tentang`
        }
    };
    res.render('tentang', { seo });
});

// 3. PROGRAM KERJA
app.get('/program-kerja', (req, res) => {
    const DB = res.locals.DB;
    const seo = {
        title: `Program Kerja | ${DB.organization.name}`,
        description: "Daftar lengkap program kerja dan realisasi legislatif periode berjalan DPM KBMFKG UMI.",
        canonical: `${BASE_URL}/program-kerja`,
        ogImage: `${BASE_URL}/img/logo-dpm.png`,
        type: "website",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Program Kerja DPM KBMFKG UMI",
            "itemListElement": DB.programs.map((prog, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": prog.name,
                "description": prog.description
            }))
        }
    };
    res.render('programkerja', { seo });
});

// 4. BERITA TERKINI
app.get('/berita', (req, res) => {
    const DB = res.locals.DB;
    const seo = {
        title: `Pusat Informasi & Berita | ${DB.organization.name}`,
        description: "Publikasi resmi, berita terkini, dan dokumentasi kegiatan legislatif DPM KBMFKG UMI.",
        canonical: `${BASE_URL}/berita`,
        ogImage: `${BASE_URL}/img/logo-dpm.png`,
        type: "website",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Berita DPM KBMFKG UMI",
            "url": `${BASE_URL}/berita`
        }
    };
    res.render('berita', { seo });
});

// 5. OUR TEAM
app.get('/our-team', (req, res) => {
    const seo = {
        title: `Our Team | DPM KBMFKG UMI`,
        description: "Susunan Dewan Penasihat dan Pengurus Inti DPM KBMFKG UMI.",
        canonical: `${BASE_URL}/our-team`,
        ogImage: `${BASE_URL}/img/logo-dpm.png`,
        type: "profile"
    };
    res.render('ourteam', { seo });
});

// 6. ADMIN DASHBOARD
app.get('/admin', (req, res) => {
    const seo = {
        title: `Workspace Admin | DPM KBMFKG UMI`,
        description: "Sistem Manajemen Informasi DPM KBMFKG UMI",
        canonical: `${BASE_URL}/admin`,
        type: "website"
    };
    res.render('admin-dashboard', { seo });
});

// Fallback 404
app.use((req, res) => {
    const seo = { title: "404 Halaman Tidak Ditemukan | DPM KBMFKG UMI", description: "Halaman yang Anda cari tidak ditemukan." };
    res.status(404).render('admin-404', { seo });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));
}
module.exports = app;