'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  GitBranch, 
  LogOut, 
  User as UserIcon,
} from 'lucide-react';
import Image from 'next/image';

const NavItem = ({ href, icon: Icon, label, pathname }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; pathname: string }) => {
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-6 py-3 transition-colors duration-200 border-l-[3px] ${
        isActive 
          ? 'bg-amber-900/5 text-[#C9A84C] border-[#C9A84C]' 
          : 'text-[#6b6b6b] hover:text-white border-transparent'
      }`}
    >
      <Icon size={18} />
      <span className={`${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="fixed inset-0 bg-[#000000] flex items-center justify-center z-[100]">
        <div className="w-3 h-3 bg-[#C9A84C] rounded-full animate-pulse-dot" />
        <style jsx>{`
          @keyframes pulse-dot {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .animate-pulse-dot {
            animation: pulse-dot 1.5s infinite;
          }
        `}</style>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;



  return (
    <div className="min-h-screen bg-black flex selection:bg-[#C9A84C] selection:text-black text-[#ededed]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0a0a0a] border-r border-[#2a2a2a] z-50 flex flex-col">
        <div className="p-8">
          <Link href="/" className="text-xl font-bold text-[#C9A84C] tracking-tighter hover:opacity-80 transition-opacity block">
            CodeHalcon 🦅
          </Link>
        </div>

        <nav className="mt-4 flex-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" pathname={pathname} />
          <NavItem href="/dashboard/repos" icon={GitBranch} label="Repositories" pathname={pathname} />
        </nav>

        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden flex items-center justify-center">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} className="text-[#6b6b6b]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-[#ededed]">
                {session?.user?.name || session?.user?.login}
              </p>
              <p className="text-[10px] text-[#6b6b6b] truncate">
                GitHub Connected
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-2 py-3 text-[#6b6b6b] hover:text-white transition-colors duration-200 mt-2"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 relative min-h-screen flex flex-col">
        {/* Background Layers */}
        <div className="fixed inset-0 ambient-grid opacity-10 pointer-events-none -z-10" />
        <div className="fixed inset-0 ambient-noise opacity-5 pointer-events-none -z-10" />

        {/* Top Bar */}
        <header className="h-[60px] border-bottom border-[#2a2a2a] border-b flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b]">
            {pathname === '/dashboard' ? 'Overview' : pathname?.split('/').pop()?.replaceAll('-', ' ')}
          </h1>
          <div className="w-8 h-8 opacity-20 text-[#C9A84C]">
            <svg viewBox="0 0 200 120" fill="currentColor">
              <path d="M10,60 Q30,20 60,30 Q80,35 90,25 Q110,10 140,15 Q170,20 190,40 Q170,45 150,40 Q130,50 120,60 Q110,80 90,85 Q70,90 50,80 Q30,85 10,60 Z" />
            </svg>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
