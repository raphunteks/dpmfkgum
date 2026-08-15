"use client";

import React, { useState } from 'react';
import { 
  Home, Users, Briefcase, LayoutDashboard, LogOut, ArrowRight, 
  Menu, X, Calendar, Newspaper, Activity, ShieldCheck, ChevronRight
} from 'lucide-react';

// --- MOCK DATABASE ---
const MOCK_NEWS = [
  { id: 1, title: 'Rapat Kerja DPM KBMFKG UMI 2024', date: '12 Agustus 2024', category: 'Agenda', excerpt: 'Membahas penetapan program kerja selama satu periode kepengurusan ke depan.' },
  { id: 2, title: 'Serap Aspirasi Mahasiswa Angkatan 2023', date: '05 Agustus 2024', category: 'Aspirasi', excerpt: 'Dialog interaktif antara pimpinan DPM dengan perwakilan mahasiswa angkatan 2023.' },
  { id: 3, title: 'Sosialisasi Peraturan Organisasi Terbaru', date: '28 Juli 2024', category: 'Legislasi', excerpt: 'Pemaparan draft PO terbaru yang akan diterapkan pada periode ini.' },
];

const MOCK_STATS = [
  { label: 'Total Anggota', value: '45', icon: Users, color: 'text-blue-400' },
  { label: 'Program Kerja', value: '12', icon: Briefcase, color: 'text-green-400' },
  { label: 'Agenda Mendatang', value: '3', icon: Calendar, color: 'text-purple-400' },
  { label: 'Berita Dirilis', value: '28', icon: Newspaper, color: 'text-amber-400' },
];

export default function WebApp() {
  const [currentView, setCurrentView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State (Demo Only)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleNav = (id: string) => { 
    setCurrentView(id); 
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      setIsLoggedIn(true);
      setCurrentView('admin');
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Credential salah! Gunakan admin / admin123 untuk demo.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-green-500/20">
              DPM
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">DPM KBMFKG</h1>
              <p className="text-[10px] uppercase tracking-wider text-green-400 font-semibold">Universitas Muslim Indonesia</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <NavBtn label="Beranda" icon={Home} isActive={currentView === 'home'} onClick={() => handleNav('home')} />
            <NavBtn label="Berita" icon={Newspaper} isActive={currentView === 'news'} onClick={() => handleNav('news')} />
            
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            
            {isLoggedIn ? (
              <button onClick={() => handleNav('admin')} className="ml-2 px-4 py-2 rounded-xl font-medium flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 transition">
                <LayoutDashboard size={16} /> Dashboard
              </button>
            ) : (
              <button onClick={() => handleNav('login')} className="ml-2 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-white/10 text-slate-300 transition">
                <ShieldCheck size={16} /> Login
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-300 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10 animate-slide-up">
            <div className="px-4 py-6 flex flex-col gap-3">
              <MobileNavBtn label="Beranda" icon={Home} isActive={currentView === 'home'} onClick={() => handleNav('home')} />
              <MobileNavBtn label="Berita" icon={Newspaper} isActive={currentView === 'news'} onClick={() => handleNav('news')} />
              <hr className="border-white/10 my-2" />
              {isLoggedIn ? (
                <MobileNavBtn label="Dashboard Admin" icon={LayoutDashboard} isActive={currentView === 'admin'} onClick={() => handleNav('admin')} />
              ) : (
                <MobileNavBtn label="Login Admin" icon={ShieldCheck} isActive={currentView === 'login'} onClick={() => handleNav('login')} />
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* --- VIEW: HOME --- */}
        {currentView === 'home' && (
          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[70vh] text-center">
            <span className="px-4 py-1.5 text-xs font-semibold rounded-full border bg-green-500/10 text-green-400 border-green-500/30 mb-8 backdrop-blur-md">
              Platform Digital Resmi
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Satu Platform. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Satu Jejak Organisasi.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              Pusat informasi, transparansi, dan dokumentasi digital Dewan Perwakilan Mahasiswa Keluarga Besar Mahasiswa Fakultas Kedokteran Gigi Universitas Muslim Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleNav('news')} className="px-8 py-3.5 text-base rounded-xl font-medium bg-white text-slate-900 hover:bg-slate-200 shadow-xl transition-all flex items-center justify-center gap-2">
                Baca Berita Terbaru <ArrowRight size={18}/>
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW: NEWS --- */}
        {currentView === 'news' && (
          <div className="animate-slide-up">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-3">Berita & Publikasi</h2>
              <p className="text-slate-400">Informasi terbaru seputar kegiatan dan regulasi DPM KBMFKG UMI.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_NEWS.map((news) => (
                <div key={news.id} className="glass-card rounded-2xl p-6 group cursor-pointer flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{news.category}</span>
                    <span className="text-xs text-slate-500">{news.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">{news.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{news.excerpt}</p>
                  <div className="flex items-center text-sm font-medium text-slate-300 group-hover:text-white transition-colors mt-auto">
                    Baca selengkapnya <ChevronRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: LOGIN --- */}
        {currentView === 'login' && !isLoggedIn && (
          <div className="min-h-[60vh] flex items-center justify-center animate-slide-up">
            <div className="glass-card rounded-3xl p-8 md:p-10 w-full max-w-md border-t-green-500/30">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <ShieldCheck size={32} className="text-slate-900" />
                </div>
                <h2 className="text-2xl font-bold text-white">Login Pengurus</h2>
                <p className="text-sm text-slate-400 mt-2">Akses CMS DPM KBMFKG UMI</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                  <input 
                    type="text" required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    placeholder="Masukkan username (demo: admin)" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <input 
                    type="password" required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    placeholder="Masukkan password (demo: admin123)" 
                  />
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-green-500/25 mt-4">
                  Masuk ke Dashboard
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- VIEW: ADMIN DASHBOARD --- */}
        {currentView === 'admin' && isLoggedIn && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="text-green-400" size={28} /> CMS Workspace
                </h2>
                <p className="text-slate-400 mt-1">Periode Aktif: 2024/2025</p>
              </div>
              <button 
                onClick={() => { setIsLoggedIn(false); handleNav('home'); }} 
                className="px-5 py-2.5 rounded-xl font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-2 transition"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {MOCK_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="glass-card rounded-2xl p-6 flex items-center gap-5">
                    <div className={`p-4 rounded-xl bg-white/5 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audit Log Mock */}
            <div className="glass-card rounded-2xl p-1 overflow-hidden">
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Aktivitas Terbaru</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-white/5 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tindakan</th>
                      <th className="px-6 py-4 font-medium">Entitas</th>
                      <th className="px-6 py-4 font-medium">Oleh</th>
                      <th className="px-6 py-4 font-medium">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">PUBLISH</span></td>
                      <td className="px-6 py-4">Berita: "Rapat Kerja 2024"</td>
                      <td className="px-6 py-4">Admin Utama</td>
                      <td className="px-6 py-4">Baru saja</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">UPDATE</span></td>
                      <td className="px-6 py-4">Struktur Organisasi</td>
                      <td className="px-6 py-4">Admin Utama</td>
                      <td className="px-6 py-4">2 jam yang lalu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- MICRO COMPONENTS ---
const NavBtn = ({ label, icon: Icon, isActive, onClick }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    <Icon size={16} /> {label}
  </button>
);

const MobileNavBtn = ({ label, icon: Icon, isActive, onClick }: any) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${isActive ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:bg-white/5'}`}>
    <Icon size={18} /> {label}
  </button>
);