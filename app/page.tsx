"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Briefcase, Newspaper, Landmark, LayoutDashboard, 
  LogIn, LogOut, Menu, X, Instagram, Youtube, Mail, Search, 
  Clock, CalendarDays, ArrowRight, Target, ListChecks, CheckCircle, 
  ShieldCheck, User, Plus, Edit, Trash2, Download, Eye, Settings, 
  Save, CheckCircle2, Info
} from 'lucide-react';

// --- MOCK DATABASE ---
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
    { id: 'p1', name: 'Periode 2023/2024', status: 'ARCHIVED', startDate: '2023-01-01', endDate: '2023-12-31' },
    { id: 'p2', name: 'Periode 2024/2025', status: 'ACTIVE', startDate: '2024-01-01', endDate: '2024-12-31' }
  ],
  news: [
    { id: 'n1', title: 'Sidang Umum KBMFKG UMI Ke-XV Berlangsung Sukses', date: '2025-08-10', excerpt: 'Sidang umum menetapkan garis besar haluan organisasi untuk satu periode ke depan.', image: 'https://placehold.co/600x400/1e293b/22c55e?text=Sidang+Umum', status: 'PUBLISHED' },
    { id: 'n2', title: 'Jaring Aspirasi Mahasiswa (JARA) Angkatan 2024', date: '2025-08-14', excerpt: 'DPM KBMFKG UMI turun langsung mendengarkan keluhan dan masukan dari mahasiswa baru.', image: 'https://placehold.co/600x400/1e293b/3b82f6?text=Jaring+Aspirasi', status: 'PUBLISHED' },
    { id: 'n3', title: 'Draft Revisi AD/ART Tahap I', date: '2025-08-15', excerpt: 'Pembahasan draft revisi menyesuaikan dinamika mahasiswa terkini.', image: 'https://placehold.co/600x400/1e293b/a855f7?text=Revisi+Aturan', status: 'DRAFT' },
  ],
  programs: [
    { id: 'pr1', name: 'Legislative Class', status: 'ONGOING', description: 'Pelatihan dasar-dasar legislasi, persidangan, dan administrasi.', target: 'Seluruh Anggota KBMFKG' },
    { id: 'pr2', name: 'Jaring Aspirasi (JARA)', status: 'COMPLETED', description: 'Pengumpulan aspirasi dari setiap angkatan aktif.', target: 'Mahasiswa FKG UMI' },
    { id: 'pr3', name: 'Audit Keuangan BEM', status: 'PLANNED', description: 'Pemeriksaan laporan pertanggungjawaban keuangan tengah tahun.', target: 'BEM KBMFKG UMI' },
  ],
  events: [
    { id: 'e1', title: 'Rapat Kerja Nasional ISMKMI', date: '2025-09-01', location: 'Jakarta' },
    { id: 'e2', title: 'Evaluasi Triwulan I', date: '2025-09-15', location: 'Ruang Senat FKG UMI' }
  ],
  members: [
    { id: 'm1', nim: '1612021001', name: 'Ahmad Faisal', role: 'Ketua Umum', status: 'ACTIVE' },
    { id: 'm2', nim: '1612021045', name: 'Siti Nurhaliza', role: 'Sekretaris Jenderal', status: 'ACTIVE' },
    { id: 'm3', nim: '1612021088', name: 'Budi Santoso', role: 'Ketua Komisi I (Legislasi)', status: 'ACTIVE' },
    { id: 'm4', nim: '1612020012', name: 'Dian Sastro', role: 'Anggota Demisioner', status: 'INACTIVE' },
  ]
};

// --- KOMPONEN UI DASAR ---

// FIX: Card sekarang menerima onClick opsional
const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div className={`glass-card rounded-2xl p-6 ${className}`} onClick={onClick}>{children}</div>
);

// FIX: Menggunakan tipe 'any' untuk menghindari konflik event handler di Vercel Build
const Button = ({ children, onClick, type = 'button', variant = 'primary', className = "" }: any) => {
  const baseStyle = "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants: any = {
    primary: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 border border-green-400/50",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30",
    ghost: "hover:bg-white/10 text-slate-300 hover:text-white"
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// FIX: Menambahkan deklarasi className?: string
const Badge = ({ children, status, className = "" }: { children?: React.ReactNode, status: string, className?: string }) => {
  const colors: any = {
    ACTIVE: "bg-green-500/20 text-green-300 border-green-500/30",
    ARCHIVED: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    INACTIVE: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    ONGOING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
    PLANNED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    PUBLISHED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    DRAFT: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || colors.ARCHIVED} ${className}`}>
      {children || status}
    </span>
  );
};

// FIX: Menggunakan any agar tidak konflik saat Vercel mapping type
const Input = ({ label, type = "text", defaultValue, placeholder, className = "" }: any) => (
  <div className={`mb-4 text-left w-full ${className}`}>
    {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
    <input 
      type={type} 
      defaultValue={defaultValue} 
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-green-500/50 outline-none text-white rounded-xl px-4 py-2.5 text-sm transition-all"
    />
  </div>
);

const Textarea = ({ label, defaultValue, placeholder, rows = 4, className = "" }: any) => (
  <div className={`mb-4 text-left w-full ${className}`}>
    {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
    <textarea 
      defaultValue={defaultValue} 
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-green-500/50 outline-none text-white rounded-xl px-4 py-2.5 text-sm resize-none transition-all"
    ></textarea>
  </div>
);

// --- GLOBAL TOAST SYSTEM ---
let toastTimeout: NodeJS.Timeout;
const ToastManager = ({ toast }: { toast: any }) => {
  if (!toast.show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="glass bg-slate-800/80 border-green-500/30 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
        {toast.type === 'success' ? <CheckCircle2 className="text-green-400" size={20} /> : <Info className="text-blue-400" size={20} />}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

// --- LAYOUT KOMPONEN ---
const Navbar = ({ currentView, setView, isLoggedIn, setIsLoggedIn }: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'about', label: 'Organisasi', icon: Users },
    { id: 'programs', label: 'Program Kerja', icon: Briefcase },
    { id: 'news', label: 'Berita', icon: Newspaper },
  ];

  const handleNav = (id: string) => {
    setView(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-[2px] shadow-lg shadow-green-500/20">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Landmark size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">DPM KBMFKG</h1>
              <p className="text-[10px] uppercase tracking-wider text-green-400 font-semibold">Universitas Muslim Indonesia</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 glass rounded-full px-2 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} onClick={() => handleNav(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
                    ${currentView === item.id ? 'bg-white/15 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Button variant="secondary" onClick={() => handleNav('admin')} className={currentView === 'admin' ? 'border-green-500/50 text-green-300 bg-white/10' : ''}>
                <LayoutDashboard size={16} /> Dashboard
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>
                <LogIn size={16} /> Login Admin
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10 absolute w-full animate-slide-up">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} onClick={() => handleNav(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3
                    ${currentView === item.id ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
            <div className="h-px bg-white/10 my-2"></div>
            {isLoggedIn ? (
              <button onClick={() => handleNav('admin')} className="w-full text-left px-4 py-3 rounded-xl text-blue-300 hover:bg-white/5 flex items-center gap-3">
                <LayoutDashboard size={18} /> Admin Dashboard
              </button>
            ) : (
              <button onClick={() => setIsLoggedIn(true)} className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 flex items-center gap-3">
                <LogIn size={18} /> Login Admin
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="glass border-t border-white/10 mt-auto relative z-10">
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-slate-400 text-sm text-center md:text-left">
        &copy; {new Date().getFullYear()} {DB.organization.name}.<br/>
        <span className="text-xs opacity-70">Architecture by Santriman Omnibuilder V4.0</span>
      </div>
      <div className="flex gap-4">
        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><Instagram size={18} /></a>
        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><Youtube size={18} /></a>
        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"><Mail size={18} /></a>
      </div>
    </div>
  </footer>
);

// --- HALAMAN PUBLIK ---
const HomePage = ({ setView }: any) => (
  <div className="space-y-16 animate-fade-in relative z-10">
    <section className="relative pt-20 pb-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <Badge status="ACTIVE">Portal Digital Resmi</Badge>
      <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
        {DB.organization.name}
      </h1>
      <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
        {DB.organization.tagline}
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button onClick={() => setView('about')} className="px-8 py-3 text-base"><Search size={18} /> Kenali Kami</Button>
        <Button variant="secondary" onClick={() => setView('news')} className="px-8 py-3 text-base"><Newspaper size={18} /> Berita Terkini</Button>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400"><Clock size={24} /></div>
        <h3 className="text-3xl font-bold text-white mb-1">Periode Aktif</h3>
        <p className="text-slate-400 text-sm">{DB.periods.find(p => p.status === 'ACTIVE')?.name}</p>
      </Card>
      <Card className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400"><Briefcase size={24} /></div>
        <h3 className="text-3xl font-bold text-white mb-1">{DB.programs.length}</h3>
        <p className="text-slate-400 text-sm">Program Kerja</p>
      </Card>
      <Card className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400"><CalendarDays size={24} /></div>
        <h3 className="text-3xl font-bold text-white mb-1">{DB.events.length}</h3>
        <p className="text-slate-400 text-sm">Agenda Mendatang</p>
      </Card>
    </section>

    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Berita Terbaru</h2>
          <p className="text-slate-400 text-sm">Informasi seputar aktivitas legislatif</p>
        </div>
        <Button variant="ghost" onClick={() => setView('news')} className="hidden sm:flex text-sm">Lihat Semua <ArrowRight size={16} /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DB.news.filter(n => n.status === 'PUBLISHED').map(item => (
          <Card key={item.id} className="p-0 overflow-hidden group cursor-pointer" onClick={() => setView('news')}>
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-10"></div>
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-4 left-4 z-20"><Badge status={item.status}>Terbaru</Badge></div>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-400 mb-2 flex items-center gap-2"><CalendarDays size={14} /> {item.date}</p>
              <h3 className="text-lg font-semibold text-white mb-2 leading-snug group-hover:text-green-400 transition-colors">{item.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{item.excerpt}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  </div>
);

const AboutPage = () => (
  <div className="space-y-12 animate-fade-in pt-4 relative z-10">
    <div className="text-center max-w-3xl mx-auto">
      <Badge status="ACTIVE">Profil Lembaga</Badge>
      <h2 className="text-4xl font-bold mt-4 mb-4 text-white">Tentang {DB.organization.name}</h2>
      <p className="text-slate-300 leading-relaxed">{DB.organization.description}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><Target size={20} /></div>
          <h3 className="text-xl font-bold text-white">Visi</h3>
        </div>
        <p className="text-slate-300 italic">"{DB.organization.vision}"</p>
      </Card>
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400"><ListChecks size={20} /></div>
          <h3 className="text-xl font-bold text-white">Misi</h3>
        </div>
        <ul className="space-y-3">
          {DB.organization.mission.map((m, i) => (
            <li key={i} className="flex gap-3 text-slate-300 text-sm md:text-base">
              <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={18} />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>

    <div>
      <h3 className="text-2xl font-bold mb-6 text-white">Histori Kepengurusan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DB.periods.map(period => (
          <Card key={period.id} className="flex items-center justify-between hover:bg-white/5 transition-colors">
            <div>
              <h4 className="font-semibold text-base text-white">{period.name}</h4>
              <p className="text-xs text-slate-400">{period.startDate} s.d {period.endDate}</p>
            </div>
            <Badge status={period.status}>{period.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const ProgramsPage = () => (
  <div className="space-y-8 animate-fade-in pt-4 relative z-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-white">Program Kerja</h2>
        <p className="text-slate-400">Daftar program dan realisasi legislatif periode berjalan.</p>
      </div>
      <select className="glass rounded-xl px-4 py-2.5 text-sm text-white outline-none appearance-none border-white/20 cursor-pointer w-full md:w-auto">
        <option value="" className="bg-slate-800">Semua Status</option>
        <option value="PLANNED" className="bg-slate-800">Direncanakan</option>
        <option value="ONGOING" className="bg-slate-800">Berjalan</option>
        <option value="COMPLETED" className="bg-slate-800">Selesai</option>
      </select>
    </div>

    <div className="space-y-4">
      {DB.programs.map(prog => (
        <Card key={prog.id} className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:bg-white/5 transition-colors">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">{prog.name}</h3>
              <Badge status={prog.status}>{prog.status}</Badge>
            </div>
            <p className="text-slate-300 text-sm mb-3">{prog.description}</p>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1"><Users size={14} /> Sasaran: {prog.target}</span>
            </p>
          </div>
          <Button variant="secondary" className="shrink-0 text-sm w-full md:w-auto">Lihat Detail</Button>
        </Card>
      ))}
    </div>
  </div>
);

const NewsPage = () => (
  <div className="space-y-8 animate-fade-in pt-4 relative z-10">
    <div>
      <h2 className="text-3xl font-bold mb-2 text-white">Pusat Informasi & Berita</h2>
      <p className="text-slate-400">Publikasi resmi dan dokumentasi kegiatan KBMFKG UMI.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {DB.news.filter(n => n.status === 'PUBLISHED').map(item => (
        <Card key={item.id} className="p-0 overflow-hidden flex flex-col">
          <div className="h-48 overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <Badge status={item.status} className="self-start mb-3">{item.status}</Badge>
            <h3 className="text-lg font-bold mb-2 leading-tight text-white">{item.title}</h3>
            <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3">{item.excerpt}</p>
            <p className="text-xs text-slate-500 border-t border-white/10 pt-3 flex items-center gap-1"><CalendarDays size={14} /> {item.date}</p>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// --- HALAMAN ADMIN (CMS MOCKUP LENGKAP) ---
const AdminDashboard = ({ setView, showToast }: any) => {
  const [activeTab, setActiveTab] = useState('overview');

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
        ${activeTab === id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  const handleMockSubmit = (e: any, message: string) => {
    e.preventDefault();
    showToast(message, 'success');
  };

  const renderAdminContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Anggota</p>
                <h4 className="text-2xl font-bold text-white">{DB.members.length}</h4>
              </Card>
              <Card className="p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Program Aktif</p>
                <h4 className="text-2xl font-bold text-blue-400">{DB.programs.filter(p=>p.status === 'ONGOING').length}</h4>
              </Card>
              <Card className="p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Berita Publik</p>
                <h4 className="text-2xl font-bold text-emerald-400">{DB.news.filter(n=>n.status === 'PUBLISHED').length}</h4>
              </Card>
              <Card className="p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status Server</p>
                <h4 className="text-lg font-bold text-green-400 flex items-center gap-2 mt-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Online</h4>
              </Card>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-white">Aktivitas Sistem (Mock)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                      <th className="px-4 py-3">Aktor</th>
                      <th className="px-4 py-3">Aksi</th>
                      <th className="px-4 py-3 rounded-tr-lg">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-slate-300">Baru saja</td>
                      <td className="px-4 py-3 font-medium text-white">Admin Pusat</td>
                      <td className="px-4 py-3"><Badge status="PUBLISHED">LOGIN</Badge></td>
                      <td className="px-4 py-3 text-slate-300">Berhasil masuk ke sistem CMS</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-slate-300">Kemarin</td>
                      <td className="px-4 py-3 font-medium text-white">Editor 1</td>
                      <td className="px-4 py-3"><Badge status="ACTIVE">UPDATE</Badge></td>
                      <td className="px-4 py-3 text-slate-300">Memperbarui Berita "Sidang Umum"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'periods':
        return (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Manajemen Kepengurusan</h3>
              <Button onClick={(e: any) => handleMockSubmit(e, 'Fitur tambah periode belum tersedia di mode demo')} variant="secondary" className="text-xs"><Plus size={14} /> Tambah Periode</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Nama Periode</th>
                    <th className="px-4 py-3">Tgl Mulai</th>
                    <th className="px-4 py-3">Tgl Selesai</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {DB.periods.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-4 font-medium text-white">{p.name}</td>
                      <td className="px-4 py-4 text-slate-300">{p.startDate}</td>
                      <td className="px-4 py-4 text-slate-300">{p.endDate}</td>
                      <td className="px-4 py-4"><Badge status={p.status}>{p.status}</Badge></td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={(e) => handleMockSubmit(e, 'Mode demo: Edit dibatasi')} className="text-blue-400 hover:text-blue-300 p-2"><Edit size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'content':
        return (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Manajemen Berita</h3>
              <Button onClick={(e: any) => handleMockSubmit(e, 'Membuka editor berita (Mock)')} className="text-xs"><Plus size={14} /> Tulis Berita</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Judul Berita</th>
                    <th className="px-4 py-3">Tanggal Publish</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {DB.news.map(n => (
                    <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-4 font-medium text-white max-w-[200px] truncate">{n.title}</td>
                      <td className="px-4 py-4 text-slate-300">{n.date}</td>
                      <td className="px-4 py-4"><Badge status={n.status}>{n.status}</Badge></td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button onClick={(e) => handleMockSubmit(e, 'Edit Berita diklik')} className="text-blue-400 hover:text-blue-300 p-1"><Edit size={16} /></button>
                        <button onClick={(e) => handleMockSubmit(e, 'Hapus Berita diblokir')} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'database':
        return (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Database Anggota</h3>
              <Button onClick={(e: any) => handleMockSubmit(e, 'Import CSV Anggota')} variant="secondary" className="text-xs"><Download size={14} /> Import CSV</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">NIM</th>
                    <th className="px-4 py-3">Nama Lengkap</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {DB.members.map(m => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-4 text-slate-300 font-mono">{m.nim}</td>
                      <td className="px-4 py-4 font-medium text-white">{m.name}</td>
                      <td className="px-4 py-4 text-slate-300">{m.role}</td>
                      <td className="px-4 py-4"><Badge status={m.status}>{m.status}</Badge></td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={(e) => handleMockSubmit(e, 'Lihat Profil')} className="text-slate-400 hover:text-white p-2"><Eye size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'settings':
        return (
          <Card className="animate-fade-in">
            <h3 className="font-bold text-lg text-white mb-6 border-b border-white/10 pb-4">Pengaturan Profil Organisasi</h3>
            <form onSubmit={(e) => handleMockSubmit(e, 'Konfigurasi berhasil disimpan!')} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Organisasi" defaultValue={DB.organization.name} />
                <Input label="Email Kontak Resmi" defaultValue="sekretariat@dpmfkgumi.ac.id" type="email" />
              </div>
              <Input label="Tagline" defaultValue={DB.organization.tagline} />
              <Textarea label="Deskripsi Singkat" defaultValue={DB.organization.description} rows={3} />
              <Textarea label="Visi" defaultValue={DB.organization.vision} rows={2} />
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-4">
                <Button variant="ghost" type="button">Batal</Button>
                <Button type="submit"><Save size={16} /> Simpan Perubahan</Button>
              </div>
            </form>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in pt-4 relative z-10">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-green-500" size={28} /> Workspace Admin
          </h2>
          <p className="text-sm text-slate-400 mt-1">Sistem Manajemen Informasi (Single Page Preview)</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 items-center gap-1">
            <User size={12} /> Super Admin
          </span>
          <Button variant="danger" onClick={() => { showToast('Logout berhasil', 'info'); setView('home'); }} className="text-sm">
            <LogOut size={16} /> Keluar
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <SidebarItem id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="periods" label="Kepengurusan" icon={Clock} />
          <SidebarItem id="content" label="Konten & Berita" icon={Newspaper} />
          <SidebarItem id="database" label="Database Anggota" icon={Users} />
          <SidebarItem id="settings" label="Pengaturan Sistem" icon={Settings} />
        </div>

        <div className="flex-1 overflow-hidden">
          {renderAdminContent()}
        </div>
      </div>
    </div>
  );
};

// --- ROOT APPLICATION ---
export default function WebApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleLogin = (status: boolean) => {
    setIsLoggedIn(status);
    if (status) showToast('Login berhasil sebagai Admin (Mode Demo)', 'success');
  };

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
        return <AdminDashboard setView={setCurrentView} showToast={showToast} />;
      default: return <HomePage setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-green-500/30 font-sans">
      <Navbar currentView={currentView} setView={setCurrentView} isLoggedIn={isLoggedIn} setIsLoggedIn={handleLogin} />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {renderView()}
      </main>

      <Footer />
      <ToastManager toast={toast} />
    </div>
  );
}
