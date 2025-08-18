'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, Heart, Calculator, Shield, TrendingUp, Home, Users, 
  Gift, Wallet, Settings, ChevronDown, LogOut, PiggyBank, LogIn, 
  Star, Coins, ChevronRight, Eye, EyeOff, ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser } from '@/data/mockData';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDonDropdownOpen, setIsDonDropdownOpen] = useState(false);
  const [showWalletAmount, setShowWalletAmount] = useState(false);
  const [showSadaqahScore, setShowSadaqahScore] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Mock data for wallet and sadaqah score
  const walletBalance = 125000; // 125,000 XOF
  const sadaqahScore = 847; // Points Sadaqah

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Zakat', href: '/zakat', icon: Calculator },
    { name: 'Takaful', href: '/takaful', icon: Shield },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  ];

  const donDropdownItems = [
    { name: 'Campagnes', href: '/campagnes', icon: Heart, description: 'Soutenir des causes' },
    { name: 'Investir', href: '/investir', icon: TrendingUp, description: 'Investissements halal' },
  ];

  const profileDropdownItems = [
    { name: 'Profil', href: '/profil', icon: User },
    { name: 'Points', href: '/points', icon: Users },
    { name: 'Portefeuille', href: '/portefeuille', icon: Wallet },
    { name: 'Mes Épargnes', href: '/mes-epargnes', icon: Wallet },
    { name: 'Mes Takafuls', href: '/mes-takafuls', icon: Shield },
    { name: 'Déconnexion', href: '/logout', icon: LogOut, isLogout: true },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isDonActive = () => {
    return pathname.startsWith('/campagnes') || pathname.startsWith('/investir') || pathname.startsWith('/don');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                <Image 
                  src="/amane-logo.png" 
                  alt="Amane Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900">Amane+</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Accueil */}
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                      active 
                        ? 'text-green-800 border-b-2 border-green-800 pb-1' 
                        : 'text-gray-700 hover:text-green-800'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}

            {/* Don Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDonDropdownOpen(!isDonDropdownOpen)}
                className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  isDonActive()
                    ? 'text-green-800 border-b-2 border-green-800 pb-1' 
                    : 'text-gray-700 hover:text-green-800'
                }`}
              >
                <Gift size={16} />
                <span>Don</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${isDonDropdownOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>

              {/* Don Dropdown Menu */}
              <AnimatePresence>
                {isDonDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {donDropdownItems.map((item, index) => {
                      const active = isActive(item.href);
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsDonDropdownOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 transition-colors duration-200 ${
                              active
                                ? 'text-green-800 bg-green-50'
                                : 'text-gray-700 hover:text-green-800 hover:bg-green-50'
                            }`}
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <item.icon size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet Balance */}
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-1.5"
              >
                <div className="flex items-center space-x-2">
                  <Wallet size={14} className="text-green-600" />
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Solde</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-bold text-green-800">
                        {showWalletAmount ? formatAmount(walletBalance) : '••••••'}
                      </p>
                      <button
                        onClick={() => setShowWalletAmount(!showWalletAmount)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={showWalletAmount ? "Masquer le montant" : "Afficher le montant"}
                      >
                        {showWalletAmount ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sadaqah Score */}
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg px-3 py-1.5"
              >
                <div className="flex items-center space-x-2">
                  <Star size={14} className="text-orange-600" />
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Sadaqah</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-bold text-orange-800">
                        {showSadaqahScore ? `${sadaqahScore} pts` : '••••'}
                      </p>
                      <button
                        onClick={() => setShowSadaqahScore(!showSadaqahScore)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={showSadaqahScore ? "Masquer le score" : "Afficher le score"}
                      >
                        {showSadaqahScore ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu with Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    isActive('/profil') || isActive('/points') || isActive('/portefeuille') || isActive('/mes-epargnes') || isActive('/mes-takafuls')
                      ? 'text-green-800'
                      : 'text-gray-700 hover:text-green-800'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium hidden lg:block">{currentUser.name}</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      {profileDropdownItems.map((item, index) => {
                        const active = isActive(item.href);
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                if (item.isLogout) {
                                  logout();
                                  window.location.href = '/';
                                }
                              }}
                              className={`flex items-center space-x-3 px-4 py-3 transition-colors duration-200 ${
                                item.isLogout 
                                  ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                                  : active
                                    ? 'text-green-800 bg-green-50'
                                    : 'text-gray-700 hover:text-green-800 hover:bg-green-50'
                              }`}
                            >
                              <item.icon size={18} />
                              <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/connexion"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-800 transition-colors duration-200"
                  >
                    <LogIn size={16} />
                    <span className="font-medium">Se connecter</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/inscription"
                    className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-900 transition-all duration-200"
                  >
                    S'inscrire
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Accueil */}
              {navigationItems.map((item, index) => {
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                        active 
                          ? 'bg-green-50 text-green-800' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={20} className={active ? 'text-green-800' : 'text-gray-600'} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Don Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Gift size={16} className="text-green-600" />
                    <span>Don</span>
                  </h3>
                  <div className="space-y-1 ml-6">
                    {donDropdownItems.map((item, index) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                            active 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon size={16} className={active ? 'text-green-800' : 'text-gray-600'} />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Wallet and Score for Mobile */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-3"
                >
                  {/* Wallet Balance */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Solde</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-green-800">
                          {showWalletAmount ? formatAmount(walletBalance) : '••••••'}
                        </span>
                        <button
                          onClick={() => setShowWalletAmount(!showWalletAmount)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={showWalletAmount ? "Masquer le montant" : "Afficher le montant"}
                        >
                          {showWalletAmount ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sadaqah Score */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star size={16} className="text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Score Sadaqah</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-orange-800">
                          {showSadaqahScore ? `${sadaqahScore} pts` : '••••'}
                        </span>
                        <button
                          onClick={() => setShowSadaqahScore(!showSadaqahScore)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={showSadaqahScore ? "Masquer le score" : "Afficher le score"}
                        >
                          {showSadaqahScore ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Profile dropdown items in mobile */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-4 border-t border-gray-100"
                >
                  <div className="flex items-center space-x-3 p-3 mb-4">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  {profileDropdownItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            setIsOpen(false);
                            if (item.isLogout) {
                              logout();
                              window.location.href = '/';
                            }
                          }}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                            item.isLogout 
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                              : active
                                ? 'bg-green-50 text-green-800'
                                : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon size={20} className={item.isLogout ? 'text-red-600' : active ? 'text-green-800' : 'text-gray-600'} />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-4 border-t border-gray-100 space-y-3"
                >
                  <Link
                    href="/connexion"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogIn size={20} className="text-gray-600" />
                    <span className="font-medium">Se connecter</span>
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-green-800 text-white transition-all duration-200"
                  >
                    <User size={20} />
                    <span className="font-medium">S'inscrire</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 