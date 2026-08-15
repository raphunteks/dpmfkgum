import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DPM KBMFKG UMI - Digital Platform',
  description: 'Satu Platform, Satu Informasi, Satu Jejak Organisasi. Dewan Perwakilan Mahasiswa KBMFKG UMI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-mesh antialiased relative`}>
        {/* Animated Background Blobs untuk efek Glassmorphism */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob delay-1000 pointer-events-none z-[-1]"></div>
        
        {children}
      </body>
    </html>
  );
}