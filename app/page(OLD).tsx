<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DPM KBMFKG UMI - Digital Platform</title>
    
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Babel untuk JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Phosphor Icons -->
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 900: '#14532d',
                        }
                    },
                    animation: {
                        'blob': 'blob 7s infinite',
                        'fade-in': 'fadeIn 0.5s ease-out forwards',
                    },
                    keyframes: {
                        blob: {
                            '0%': { transform: 'translate(0px, 0px) scale(1)' },
                            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                            '100%': { transform: 'translate(0px, 0px) scale(1)' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0', transform: 'translateY(10px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        }
                    }
                }
            }
        }
    </script>

    <style>
        /* Base Dark Theme for Glassmorphism */
        body {
            background-color: #0f172a; /* Slate 900 */
            color: #f8fafc;
            overflow-x: hidden;
        }

        /* Animated Mesh Gradient Background */
        .bg-mesh {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: -1;
            background-image: 
                radial-gradient(at 0% 0%, hsla(145,100%,20%,1) 0px, transparent 50%),
                radial-gradient(at 100% 0%, hsla(215,100%,20%,1) 0px, transparent 50%),
                radial-gradient(at 100% 100%, hsla(250,100%,20%,1) 0px, transparent 50%),
                radial-gradient(at 0% 100%, hsla(145,100%,15%,1) 0px, transparent 50%);
            filter: blur(80px);
            opacity: 0.8;
        }

        /* Core Glassmorphism Utility Class */
        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        .glass-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
    </style>
</head>
<body>
    <!-- Background Elements -->
    <div class="bg-mesh"></div>
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
    <div class="fixed top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;

        // --- MOCK DATABASE (Berdasarkan Skema MD) ---
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
                { id: 'n1', title: 'Sidang Umum KBMFKG UMI Ke-XV Berlangsung Sukses', date: '2025-08-10', excerpt: 'Sidang umum menetapkan garis besar haluan organisasi untuk satu periode ke depan.', image: 'https://placehold.co/600x400/1e293b/22c55e?text=Sidang+Umum', status: 'PUBLISHED' },
                { id: 'n2', title: 'Jaring Aspirasi Mahasiswa (JARA) Angkatan 2024', date: '2025-08-14', excerpt: 'DPM KBMFKG UMI turun langsung mendengarkan keluhan dan masukan dari mahasiswa baru.', image: 'https://placehold.co/600x400/1e293b/3b82f6?text=Jaring+Aspirasi', status: 'PUBLISHED' },
            ],
            programs: [
                { id: 'pr1', name: 'Legislative Class', status: 'ONGOING', description: 'Pelatihan dasar-dasar legislasi, persidangan, dan administrasi.', target: 'Seluruh Anggota KBMFKG' },
                { id: 'pr2', name: 'Jaring Aspirasi (JARA)', status: 'COMPLETED', description: 'Pengumpulan aspirasi dari setiap angkatan aktif.', target: 'Mahasiswa FKG UMI' },
                { id: 'pr3', name: 'Audit Keuangan BEM', status: 'PLANNED', description: 'Pemeriksaan laporan pertanggungjawaban keuangan tengah tahun.', target: 'BEM KBMFKG UMI' },
            ],
            events: [
                { id: 'e1', title: 'Rapat Kerja Nasional ISMKMI', date: '2025-09-01', location: 'Jakarta' },
                { id: 'e2', title: 'Evaluasi Triwulan I', date: '2025-09-15', location: 'Ruang Senat FKG UMI' }
            ]
        };

        // --- KOMPONEN UI DASAR (Design System) ---

        const Card = ({ children, className = "" }) => (
            <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>
        );

        const Button = ({ children, onClick, variant = 'primary', className = "" }) => {
            const baseStyle = "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2";
            const variants = {
                primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30",
                secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
                danger: "bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30",
                ghost: "hover:bg-white/10 text-slate-300 hover:text-white"
            };
            return (
                <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
                    {children}
                </button>
            );
        };

        const Badge = ({ children, status }) => {
            const colors = {
                ACTIVE: "bg-green-500/20 text-green-300 border-green-500/30",
                ARCHIVED: "bg-slate-500/20 text-slate-300 border-slate-500/30",
                ONGOING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                COMPLETED: "bg-brand-500/20 text-brand-300 border-brand-500/30",
                PLANNED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                PUBLISHED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            };
            return (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || colors.ARCHIVED}`}>
                    {children || status}
                </span>
            );
        }

        // --- KOMPONEN LAYOUT ---

        const Navbar = ({ currentView, setView, isLoggedIn, setIsLoggedIn }) => {
            const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

            const navItems = [
                { id: 'home', label: 'Beranda', icon: 'ph-house' },
                { id: 'about', label: 'Organisasi', icon: 'ph-users' },
                { id: 'programs', label: 'Program Kerja', icon: 'ph-briefcase' },
                { id: 'news', label: 'Berita', icon: 'ph-newspaper' },
            ];

            const handleNav = (id) => {
                setView(id);
                setIsMobileMenuOpen(false);
            };

            return (
                <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            {/* Logo */}
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-blue-500 p-[2px]">
                                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                                        <i className="ph ph-scales text-xl text-white"></i>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg leading-tight tracking-tight">DPM KBMFKG</h1>
                                    <p className="text-xs text-slate-400 font-medium">Universitas Muslim Indonesia</p>
                                </div>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-1 glass rounded-full px-2 py-1">
                                {navItems.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleNav(item.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
                                            ${currentView === item.id ? 'bg-white/15 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <i className={`ph ${item.icon} text-lg`}></i>
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="hidden md:flex items-center gap-3">
                                {isLoggedIn ? (
                                    <Button variant="secondary" onClick={() => handleNav('admin')} className={currentView === 'admin' ? 'border-brand-500/50 text-brand-300' : ''}>
                                        <i className="ph ph-squares-four"></i> Dashboard
                                    </Button>
                                ) : (
                                    <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>
                                        <i className="ph ph-sign-in"></i> Login Admin
                                    </Button>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden flex items-center">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                                    <i className={`ph ${isMobileMenuOpen ? 'ph-x' : 'ph-list'} text-2xl`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden glass border-t border-white/10 absolute w-full animate-fade-in">
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                {navItems.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleNav(item.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3
                                            ${currentView === item.id ? 'bg-brand-500/20 text-brand-300' : 'text-slate-300 hover:bg-white/5'}`}
                                    >
                                        <i className={`ph ${item.icon} text-xl`}></i>
                                        {item.label}
                                    </button>
                                ))}
                                <div className="h-px bg-white/10 my-2"></div>
                                {isLoggedIn ? (
                                    <button onClick={() => handleNav('admin')} className="w-full text-left px-4 py-3 rounded-xl text-blue-300 hover:bg-white/5 flex items-center gap-3">
                                        <i className="ph ph-squares-four text-xl"></i> Admin Dashboard
                                    </button>
                                ) : (
                                    <button onClick={() => setIsLoggedIn(true)} className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 flex items-center gap-3">
                                        <i className="ph ph-sign-in text-xl"></i> Login Admin
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            );
        };

        const Footer = () => (
            <footer className="glass border-t-0 border-white/10 mt-20">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-slate-400 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} DPM KBMFKG UMI.<br/>
                        <span className="text-xs opacity-70">Architecture by Santriman Omnibuilder</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><i className="ph ph-instagram-logo text-xl"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><i className="ph ph-youtube-logo text-xl"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><i className="ph ph-envelope-simple text-xl"></i></a>
                    </div>
                </div>
            </footer>
        );

        // --- HALAMAN PUBLIK ---

        const HomePage = ({ setView }) => (
            <div className="space-y-12 animate-fade-in">
                {/* Hero Section */}
                <section className="relative pt-20 pb-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
                    <Badge status="ACTIVE">Portal Resmi v1.0</Badge>
                    <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        {DB.organization.name}
                    </h1>
                    <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        {DB.organization.tagline}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => setView('about')} className="px-8 py-3 text-lg"><i className="ph ph-magnifying-glass"></i> Kenali Kami</Button>
                        <Button variant="secondary" onClick={() => setView('news')} className="px-8 py-3 text-lg"><i className="ph ph-newspaper"></i> Berita Terkini</Button>
                    </div>
                </section>

                {/* Stats / Quick Info */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-4">
                            <i className="ph ph-clock-counter-clockwise text-2xl text-brand-400"></i>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">Periode Aktif</h3>
                        <p className="text-slate-400 text-sm">{DB.periods.find(p => p.status === 'ACTIVE').name}</p>
                    </Card>
                    <Card className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                            <i className="ph ph-briefcase text-2xl text-blue-400"></i>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{DB.programs.length}</h3>
                        <p className="text-slate-400 text-sm">Program Kerja</p>
                    </Card>
                    <Card className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                            <i className="ph ph-calendar-check text-2xl text-purple-400"></i>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{DB.events.length}</h3>
                        <p className="text-slate-400 text-sm">Agenda Mendatang</p>
                    </Card>
                </section>

                {/* Recent News Preview */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Berita Terbaru</h2>
                            <p className="text-slate-400 text-sm">Informasi seputar aktivitas legislatif</p>
                        </div>
                        <Button variant="ghost" onClick={() => setView('news')} className="hidden sm:flex">Lihat Semua <i className="ph ph-arrow-right"></i></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {DB.news.map(item => (
                            <Card key={item.id} className="p-0 overflow-hidden group cursor-pointer" onClick={() => setView('news')}>
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <Badge status={item.status}>Terbaru</Badge>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-2"><i className="ph ph-calendar"></i> {item.date}</p>
                                    <h3 className="text-lg font-semibold text-white mb-2 leading-snug group-hover:text-brand-400 transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2">{item.excerpt}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        );

        const AboutPage = () => (
            <div className="space-y-8 animate-fade-in pt-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <Badge status="ACTIVE">Profil Lembaga</Badge>
                    <h2 className="text-4xl font-bold mt-4 mb-4">Tentang {DB.organization.name}</h2>
                    <p className="text-slate-300 leading-relaxed">{DB.organization.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><i className="ph ph-target text-xl"></i></div>
                            <h3 className="text-xl font-bold">Visi</h3>
                        </div>
                        <p className="text-slate-300 italic">"{DB.organization.vision}"</p>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400"><i className="ph ph-list-checks text-xl"></i></div>
                            <h3 className="text-xl font-bold">Misi</h3>
                        </div>
                        <ul className="space-y-3">
                            {DB.organization.mission.map((m, i) => (
                                <li key={i} className="flex gap-3 text-slate-300">
                                    <i className="ph ph-check-circle text-brand-500 mt-1 shrink-0"></i>
                                    <span>{m}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <h3 className="text-2xl font-bold mt-12 mb-6">Histori Kepengurusan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DB.periods.map(period => (
                        <Card key={period.id} className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-lg">{period.name}</h4>
                                <p className="text-sm text-slate-400">Database Tersimpan</p>
                            </div>
                            <Badge status={period.status}>{period.status}</Badge>
                        </Card>
                    ))}
                </div>
            </div>
        );

        const ProgramsPage = () => (
            <div className="space-y-8 animate-fade-in pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Program Kerja</h2>
                        <p className="text-slate-400">Daftar program dan realisasi legislatif periode berjalan.</p>
                    </div>
                    <select className="glass rounded-xl px-4 py-2 text-sm text-white outline-none appearance-none border-white/20">
                        <option value="" className="bg-slate-800">Semua Status</option>
                        <option value="PLANNED" className="bg-slate-800">Direncanakan</option>
                        <option value="ONGOING" className="bg-slate-800">Berjalan</option>
                        <option value="COMPLETED" className="bg-slate-800">Selesai</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {DB.programs.map(prog => (
                        <Card key={prog.id} className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold">{prog.name}</h3>
                                    <Badge status={prog.status}>{prog.status}</Badge>
                                </div>
                                <p className="text-slate-300 text-sm mb-2">{prog.description}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-2"><i className="ph ph-users"></i> Sasaran: {prog.target}</p>
                            </div>
                            <Button variant="secondary" className="shrink-0 text-sm">Lihat Detail</Button>
                        </Card>
                    ))}
                </div>
            </div>
        );

        const NewsPage = () => (
            <div className="space-y-8 animate-fade-in pt-8">
                 <div>
                    <h2 className="text-3xl font-bold mb-2">Pusat Informasi & Berita</h2>
                    <p className="text-slate-400">Publikasi resmi dan dokumentasi kegiatan KBMFKG UMI.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {DB.news.map(item => (
                        <Card key={item.id} className="p-0 overflow-hidden flex flex-col">
                            <div className="h-48 overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <Badge status={item.status} className="self-start mb-3">{item.status}</Badge>
                                <h3 className="text-lg font-bold mb-2 leading-tight">{item.title}</h3>
                                <p className="text-sm text-slate-400 mb-4 flex-1">{item.excerpt}</p>
                                <p className="text-xs text-slate-500 border-t border-white/10 pt-3"><i className="ph ph-calendar"></i> {item.date}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );

        // --- HALAMAN ADMIN (CMS MOCKUP) ---

        const AdminDashboard = ({ setView }) => {
            const [activeTab, setActiveTab] = useState('overview');

            const SidebarItem = ({ id, label, icon }) => (
                <button 
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                        ${activeTab === id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <i className={`ph ${icon} text-lg`}></i> {label}
                </button>
            );

            return (
                <div className="animate-fade-in pt-4">
                    {/* Header Admin */}
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <i className="ph ph-shield-check text-brand-500"></i> Workspace Admin
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">Sistem Manajemen Informasi DPM KBMFKG UMI</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                                <i className="ph ph-user"></i> Super Admin
                            </span>
                            <Button variant="danger" onClick={() => { /* Mock Logout, back to home */ setView('home'); }} className="text-sm">
                                <i className="ph ph-sign-out"></i> Keluar
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full lg:w-64 shrink-0 space-y-2">
                            <SidebarItem id="overview" label="Dashboard" icon="ph-squares-four" />
                            <SidebarItem id="periods" label="Kepengurusan" icon="ph-clock-counter-clockwise" />
                            <SidebarItem id="content" label="Konten & Berita" icon="ph-newspaper" />
                            <SidebarItem id="database" label="Database Anggota" icon="ph-users" />
                            <SidebarItem id="settings" label="Pengaturan Sistem" icon="ph-gear" />
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card className="p-5">
                                            <p className="text-slate-400 text-sm mb-1">Total Anggota</p>
                                            <h4 className="text-2xl font-bold">142</h4>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-slate-400 text-sm mb-1">Program Berjalan</p>
                                            <h4 className="text-2xl font-bold text-blue-400">3</h4>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-slate-400 text-sm mb-1">Berita Publik</p>
                                            <h4 className="text-2xl font-bold text-emerald-400">12</h4>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-slate-400 text-sm mb-1">Database Load</p>
                                            <h4 className="text-2xl font-bold text-amber-400">12ms</h4>
                                        </Card>
                                    </div>

                                    <Card>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-lg">Audit Log Sistem (Mock)</h3>
                                            <Button variant="ghost" className="text-sm">Export CSV</Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                                                        <th className="px-4 py-3">Aktor</th>
                                                        <th className="px-4 py-3">Aksi</th>
                                                        <th className="px-4 py-3 rounded-tr-lg">Entitas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="px-4 py-3 text-slate-300">2026-08-16 07:15</td>
                                                        <td className="px-4 py-3 font-medium">Admin (admin@dpm.umi.ac.id)</td>
                                                        <td className="px-4 py-3"><span className="text-emerald-400">UPDATE</span></td>
                                                        <td className="px-4 py-3">Program Kerja (ID: pr1)</td>
                                                    </tr>
                                                    <tr className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="px-4 py-3 text-slate-300">2026-08-15 14:20</td>
                                                        <td className="px-4 py-3 font-medium">Admin (admin@dpm.umi.ac.id)</td>
                                                        <td className="px-4 py-3"><span className="text-blue-400">CREATE</span></td>
                                                        <td className="px-4 py-3">Berita (ID: n2)</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab !== 'overview' && (
                                <Card className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <i className="ph ph-code text-3xl text-slate-400"></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Modul {labelForTab(activeTab)}</h3>
                                    <p className="text-slate-400 max-w-md">
                                        Modul ini direpresentasikan sebagai API Endpoint di arsitektur NestJS (Phase 2). 
                                        Pada prototype Canvas ini, antarmuka dibatasi untuk demonstrasi flow.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        const labelForTab = (id) => {
            const map = { periods: 'Manajemen Kepengurusan', content: 'Manajemen Konten', database: 'Database Anggota', settings: 'Pengaturan' };
            return map[id] || id;
        }

        // --- ROOT APPLICATION ---

        const App = () => {
            const [currentView, setCurrentView] = useState('home'); // home, about, programs, news, admin
            const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulasi Auth

            // Render dinamis berdasarkan state
            const renderView = () => {
                switch(currentView) {
                    case 'home': return <HomePage setView={setCurrentView} />;
                    case 'about': return <AboutPage />;
                    case 'programs': return <ProgramsPage />;
                    case 'news': return <NewsPage />;
                    case 'admin': 
                        if (!isLoggedIn) {
                            setCurrentView('home'); 
                            return null;
                        }
                        return <AdminDashboard setView={setCurrentView} />;
                    default: return <HomePage setView={setCurrentView} />;
                }
            };

            return (
                <div className="flex flex-col min-h-screen selection:bg-brand-500/30">
                    <Navbar currentView={currentView} setView={setCurrentView} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    
                    {/* Main Content Area dengan top padding untuk navbar fixed */}
                    <main className="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        {renderView()}
                    </main>

                    <Footer />
                </div>
            );
        };

        // Render React App
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
