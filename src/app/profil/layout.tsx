'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ShareModal from '@/components/ShareModal';
import LogoutModal from '@/components/LogoutModal';

interface ProfilLayoutProps {
  children: React.ReactNode;
}

export default function ProfilLayout({ children }: ProfilLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, authReady } = useAuth();

  // Accès réservé aux utilisateurs connectés
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      const redirect = `/connexion?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirect);
    }
  }, [authReady, isAuthenticated, pathname, router]);

  const sidebarItems = [
    { 
      id: 'profile', 
      label: 'Informations personnelles', 
      icon: '/icons/profile.png',
      href: '/profil',
      title: 'Informations personnelles'
    },
    { 
      id: 'dons', 
      label: 'Mes dons', 
      icon: '/icons/don.png',
      href: '/profil/dons',
      title: 'Mes dons'
    },
    { 
      id: 'demandes', 
      label: 'Mes demandes', 
      icon: '/icons/message-question.png',
      href: '/profil/demandes',
      title: 'Mes demandes'
    },
    { 
      id: 'scores', 
      label: 'Mes Sadaka Scores', 
      icon: '/icons/medal-star-g.png',
      href: '/profil/scores',
      title: 'Mes Sadaka Scores'
    },
    { 
      id: 'classement', 
      label: 'Classements', 
      icon: '/icons/ranking.png',
      href: '/profil/classement',
      title: 'Classements'
    },
    { 
      id: 'portefeuille', 
      label: 'Portefeuille', 
      icon: '/icons/wallet-card(1).png',
      href: '/profil/portefeuille',
      title: 'Portefeuille'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: '/icons/setting-2.png',
      href: '/profil/parametres',
      title: 'Paramètres'
    },
    { 
      id: 'about', 
      label: 'À propos d\'Amane+', 
      icon: '/icons/information.png',
      href: '/profil/a-propos',
      title: 'À propos d\'Amane+'
    },
    { 
      id: 'help', 
      label: 'Aide & Support', 
      icon: '/icons/message-question.png',
      href: '/profil/aide-support',
      title: 'Aide & Support'
    },
    { 
      id: 'terms', 
      label: 'Termes et Conditions', 
      icon: '/icons/security-safe.png',
      href: '/profil/termes',
      title: 'Termes et Conditions'
    },
    { 
      id: 'invite', 
      label: 'Inviter des personnes', 
      icon: '/icons/share.png',
      href: '/profil/inviter',
      title: 'Inviter des personnes'
    },
  ];

  // Trouver l'élément actif basé sur le pathname (préférer la route la plus spécifique)
  const activeItem = [...sidebarItems]
    .filter((item) => item.id !== 'invite')
    .sort((a, b) => (b.href.length - a.href.length))
    .find((item) => {
      if (item.href === '/profil') return pathname === '/profil';
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }) || sidebarItems[0];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    router.push('/');
    setShowLogoutModal(false);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Chargement ou redirection : ne pas afficher le contenu profil
  if (!authReady || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#00644D] to-[#101919] flex items-center justify-center py-8 px-4">
        <div className="text-center text-white">
          <div className="inline-block w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/80">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#00644D] to-[#101919] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Breadcrumb - Above everything */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-white">Mon compte</span>
              <ChevronRight size={16} className="text-white/50" />
              <span className="text-[#00D9A5]">{activeItem.title}</span>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <h3 className="text-2xl sm:text-xl font-bold text-white">{activeItem.title}</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(50vh-4rem)] relative">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-80 bg-[#101919] rounded-r-2xl lg:rounded-2xl
              p-4 sm:p-6 flex flex-col
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:transform-none
            `}
          >
            {/* Close button for mobile */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h4 className="text-white font-semibold text-lg">Menu</h4>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {sidebarItems.map((item) => {
                const isActive = item.href === '/profil' 
                  ? pathname === '/profil'
                  : pathname.startsWith(item.href);
                
                // Si c'est l'élément "Inviter", on ouvre le modal au lieu de naviguer
                if (item.id === 'invite') {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsSidebarOpen(false);
                        setShowShareModal(true);
                      }}
                      className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base w-full text-left text-white hover:bg-[#00644D]/30"
                    >
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={20}
                        height={20}
                        className="opacity-70 flex-shrink-0"
                      />
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
                      isActive
                        ? 'bg-[#00644D] text-white'
                        : 'text-white hover:bg-[#00644D]/30'
                    }`}
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={20}
                      height={20}
                      className={
                        item.id === 'portefeuille'
                          ? isActive
                            ? 'brightness-0 invert flex-shrink-0'
                            : 'flex-shrink-0 opacity-90'
                          : isActive
                            ? 'brightness-0 invert'
                            : 'opacity-70 flex-shrink-0'
                      }
                      style={item.id === 'portefeuille' && !isActive ? { filter: 'brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(1500%) hue-rotate(152deg) brightness(95%) contrast(90%)' } : undefined}
                    />
                    <span className="font-medium truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all mt-auto text-sm sm:text-base"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className="font-medium">Se déconnecter</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      
      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout}
      />
    </div>
  );
}
