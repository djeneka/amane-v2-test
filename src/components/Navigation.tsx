'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, Heart, Calculator, Shield, TrendingUp, Home, Users, 
  Gift, Wallet, Settings, ChevronDown, LogOut, PiggyBank, LogIn, 
  Star, Coins, ChevronRight, Eye, EyeOff, ShoppingBag, Mail, 
  ArrowRight, ArrowUpDown, Grid3x3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser } from '@/data/mockData';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [showWalletAmount, setShowWalletAmount] = useState(false);
  const [showSadaqahScore, setShowSadaqahScore] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Mock data for wallet and sadaqah score
  const walletBalance = 125000; // 125,000 XOF
  const sadaqahScore = 847; // Points Sadaqah

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Pourquoi Amane+?', href: '/#pourquoi-amane', icon: Star, isAnchor: true },
    { name: 'Contactez-nous', href: '/contact', icon: Mail },
  ];

  const servicesItems = [
    { name: 'Dons', href: '/don', image: '/icons/don.png' },
    { name: 'Zakat', href: '/zakat', image: '/icons/profile-2user.png' },
    { name: 'Takaful', href: '/takaful', image: '/icons/purse(1).png' },
    { name: 'Investissement', href: '/investir', image: '/icons/status-up.png' },
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

  const isServicesActive = () => {
    return pathname.startsWith('/don') || pathname.startsWith('/zakat') || 
           pathname.startsWith('/takaful') || pathname.startsWith('/investir');
  };

  // Extract first name from user name
  const getUserFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (currentUser?.name) return currentUser.name.split(' ')[0];
    return 'Utilisateur';
  };

  return (
    <>
      <nav className={`shadow-sm border-b sticky top-0 z-50 ${
        isAuthenticated 
          ? 'bg-[#080909] border-[#00644D]' 
          : 'bg-[#080909] border-[#00644D]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="w-36 h-36 rounded-lg flex items-center justify-center">
                <Image 
                  src="/logo/Background(1).png" 
                  alt="Amane Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              ) : (
                <div className="w-36 h-36 rounded-lg flex items-center justify-center">
                  <Image 
                    src="/logo/Background(1).png" 
                    alt="Amane Logo" 
                    width={48} 
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Accueil (Active) */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <Home 
                    size={18} 
                    className={isActive('/') ? 'text-[#5CD07D]' : 'text-[#A8A9AB]'} 
                  />
                  <Link
                    href="/"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/')
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    Accueil
                  </Link>
                </motion.div>

                {/* Transactions */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <img 
                    src="/icons/frame.png" 
                    alt="Transactions"
                    className={`w-[18px] h-[18px] object-contain transition-all duration-200 ${
                      isActive('/portefeuille') ? 'brightness-0 saturate-100' : 'opacity-60'
                    }`}
                    style={isActive('/portefeuille') 
                      ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                      : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                    }
                  />
                  <Link
                    href="/portefeuille"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/portefeuille')
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    Transactions
                  </Link>
                </motion.div>

                {/* Communauté */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <img 
                    src="/icons/people.png" 
                    alt="Communauté"
                    className="w-[18px] h-[18px] object-contain transition-all duration-200"
                    style={isActive('/marketplace') 
                      ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                      : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                    }
                  />
                  <Link
                    href="/marketplace"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/marketplace')
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    Communauté
                  </Link>
                </motion.div>

                {/* Services */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <img 
                    src="/icons/category-2.png" 
                    alt="Services"
                    className="w-[18px] h-[18px] object-contain transition-all duration-200"
                    style={isServicesActive() 
                      ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                      : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                    }
                  />
                  <button
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className={`font-medium transition-colors duration-200 ${
                      isServicesActive()
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    Services
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                {/* Accueil */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/')
                        ? 'text-white border-b-2 border-[#00644D] pb-1' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Accueil
                  </Link>
                </motion.div>

                {/* Nos Services Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                      isServicesActive()
                        ? 'text-white border-b-2 border-[#00644D] pb-1' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span>Nos services</span>
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>
                </div>

                {/* Pourquoi Amane+? */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/#pourquoi-amane"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('pourquoi-amane');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        window.location.href = '/#pourquoi-amane';
                      }
                    }}
                    className="font-medium transition-colors duration-200 text-white/80 hover:text-white"
                  >
                    Pourquoi Amane+?
                  </Link>
                </motion.div>

                {/* Contactez-nous */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/contact"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/contact')
                        ? 'text-white border-b-2 border-[#00644D] pb-1' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Contactez-nous
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* User Menu with Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Icon */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer"
                >
                  <img 
                    src="/icons/notification-bing.png" 
                    alt="Notifications"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF3B30] rounded-full border-2 border-[#080909]"></span>
                </motion.div>

                {/* User Profile */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 transition-colors duration-200"
                  >
                    <div className="relative">
                      <img
                        src="/images/Ellipse 21(1).png"
                        alt={user?.firstName || currentUser.name}
                        className="w-10 h-10 rounded-full border-2 border-[#5CD07D]"
                      />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-bold text-white">
                        Salam, {getUserFirstName()}
                      </p>
                      <p className="text-xs text-[#A8A9AB]">
                        La patience est lumière ✨
                      </p>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
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
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/connexion"
                    className="px-4 py-2 text-white hover:text-white/80 transition-colors duration-200 border-b-2 border-[#00644D]"
                  >
                    <span className="font-medium">Se connecter</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/inscription"
                    className="text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    style={{ background: 'linear-gradient(to right, #8ECAAB, #38B7B1)' }}
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
            className="md:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
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
            className={`md:hidden border-t ${
              isAuthenticated 
                ? 'bg-[#3E4042] border-gray-500/30' 
                : 'bg-[#00644D] border-white/20'
            }`}
          >
            <div className="px-4 py-6 space-y-4">
              {isAuthenticated ? (
                <>
                  {/* Accueil */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex items-center space-x-2"
                  >
                    <Home 
                      size={18} 
                      className={isActive('/') ? 'text-[#5CD07D]' : 'text-[#A8A9AB]'} 
                    />
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/')
                          ? 'bg-white/20 text-white' 
                          : 'text-[#A8A9AB] hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Accueil</span>
                    </Link>
                  </motion.div>

                  {/* Transactions */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <img 
                      src="/icons/frame.png" 
                      alt="Transactions"
                      className="w-[18px] h-[18px] object-contain transition-all duration-200"
                      style={isActive('/portefeuille') 
                        ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                        : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                      }
                    />
                    <Link
                      href="/portefeuille"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/portefeuille')
                          ? 'bg-white/20 text-white' 
                          : 'text-[#A8A9AB] hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Transactions</span>
                    </Link>
                  </motion.div>

                  {/* Communauté */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="flex items-center space-x-2"
                  >
                    <img 
                      src="/icons/people.png" 
                      alt="Communauté"
                      className="w-[18px] h-[18px] object-contain transition-all duration-200"
                      style={isActive('/marketplace') 
                        ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                        : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                      }
                    />
                    <Link
                      href="/marketplace"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/marketplace')
                          ? 'bg-white/20 text-white' 
                          : 'text-[#A8A9AB] hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Communauté</span>
                    </Link>
                  </motion.div>

                  {/* Services */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <img 
                      src="/icons/category-2.png" 
                      alt="Services"
                      className="w-[18px] h-[18px] object-contain transition-all duration-200"
                      style={isServicesActive() 
                        ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                        : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                      }
                    />
                    <button
                      onClick={() => {
                        setIsServicesDropdownOpen(!isServicesDropdownOpen);
                      }}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 text-left ${
                        isServicesActive()
                          ? 'bg-white/20 text-white' 
                          : 'text-[#A8A9AB] hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Services</span>
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Accueil */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className={`p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Accueil</span>
                    </Link>
                  </motion.div>

                  {/* Nos Services Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white mb-2">
                        Nos services
                      </h3>
                      <div className="grid grid-cols-2 gap-2 ml-6">
                        {servicesItems.map((item, index) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${
                                active 
                                  ? 'bg-white/20 text-white' 
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-4 h-4 object-contain"
                              />
                              <span className="text-xs">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Dons */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <Link
                      href="/don"
                      onClick={() => setIsOpen(false)}
                      className={`p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/don')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Dons</span>
                    </Link>
                  </motion.div>

                  {/* Pourquoi Amane+? */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link
                      href="/#pourquoi-amane"
                      onClick={(e) => {
                        setIsOpen(false);
                        e.preventDefault();
                        const element = document.getElementById('pourquoi-amane');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          window.location.href = '/#pourquoi-amane';
                        }
                      }}
                      className="p-3 rounded-lg transition-colors duration-200 text-white/80 hover:bg-white/10"
                    >
                      <span className="font-medium">Pourquoi Amane+?</span>
                    </Link>
                  </motion.div>

                  {/* Contactez-nous */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                  >
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className={`p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/contact')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Contactez-nous</span>
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Profile dropdown items in mobile */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-4 border-t border-gray-500/30"
                >
                  {/* Notification Icon for Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="flex items-center justify-between p-3 mb-4"
                  >
                    <div className="relative cursor-pointer">
                      <img 
                        src="/icons/notification-bing.png" 
                        alt="Notifications"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF3B30] rounded-full border-2 border-[#3E4042]"></span>
                    </div>
                  </motion.div>

                  <div className="flex items-center space-x-2 p-3 mb-4">
                    <img
                      src="/images/Ellipse 21(1).png"
                      alt={user?.firstName || currentUser.name}
                      className="w-10 h-10 rounded-full border-2 border-[#5CD07D]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Salam, {getUserFirstName()}
                      </p>
                      <p className="text-xs text-[#A8A9AB]">
                        La patience est lumière ✨
                      </p>
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
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                              : active
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <item.icon size={20} className={item.isLogout ? 'text-red-400' : 'text-white'} />
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
                  className="pt-4 border-t border-white/20 space-y-3"
                >
                  <Link
                    href="/connexion"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 border-b-2 border-[#00644D]"
                  >
                    <span className="font-medium">Se connecter</span>
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-lg text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(to right, #8ECAAB, #38B7B1)' }}
                  >
                    <span className="font-medium">S'inscrire</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Services Dropdown Band */}
    <AnimatePresence>
      {isServicesDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg border-b border-gray-200 sticky top-16 z-40"
          onMouseLeave={() => setIsServicesDropdownOpen(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-12 py-4">
              {servicesItems.map((service, index) => {
                const active = isActive(service.href);
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={service.href}
                      onClick={() => setIsServicesDropdownOpen(false)}
                      className={`flex items-center space-x-2 transition-colors duration-200 ${
                        active
                          ? 'text-[#00644D]'
                          : 'text-[#00644D] hover:text-[#20B6B3]'
                      }`}
                    >
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-sm font-medium">{service.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
} 