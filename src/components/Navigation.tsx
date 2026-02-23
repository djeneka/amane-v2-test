'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, Heart, Calculator, Shield, TrendingUp, Home, Users, 
  Gift, Wallet, Settings, ChevronDown, LogOut, PiggyBank, LogIn, 
  Star, Coins, ChevronRight, Eye, EyeOff, ShoppingBag, Mail, 
  ArrowRight, ArrowUpDown, Grid3x3, Languages
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/LocaleProvider';
import { useAuth } from '@/contexts/AuthContext';
import NotificationPopup from '@/components/NotificationPopup';
import { getUnreadNotificationsCount } from '@/services/notifications';
import type { Locale } from '@/i18n/config';

export default function Navigation() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tParametres = useTranslations('parametres');
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [showWalletAmount, setShowWalletAmount] = useState(false);
  const [showSadaqahScore, setShowSadaqahScore] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, accessToken } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRefMobile = useRef<HTMLDivElement>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Charger le nombre de notifications non lues (et rafraîchir à la fermeture du popup)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setUnreadNotificationCount(0);
      return;
    }
    getUnreadNotificationsCount(accessToken)
      .then(setUnreadNotificationCount)
      .catch(() => setUnreadNotificationCount(0));
  }, [isAuthenticated, accessToken, showNotificationPopup]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      const outsideDesktop = !languageDropdownRef.current || !languageDropdownRef.current.contains(event.target as Node);
      const outsideMobile = !languageDropdownRefMobile.current || !languageDropdownRefMobile.current.contains(event.target as Node);
      if (outsideDesktop && outsideMobile) {
        setIsLanguageDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen || isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isLanguageDropdownOpen]);

  // Mock data for wallet and sadaqah score
  const walletBalance = 125000; // 125,000 XOF
  const sadaqahScore = 847; // Points Sadaqah

  const navigationItems = [
    { nameKey: 'home' as const, href: '/', icon: Home },
    { nameKey: 'whyAmane' as const, href: '/#pourquoi-amane', icon: Star, isAnchor: true },
    { nameKey: 'contactUs' as const, href: '/contact', icon: Mail },
  ];

  const servicesItems = [
    { nameKey: 'donations' as const, href: '/campagnes', image: '/icons/don.png' },
    { nameKey: 'zakat' as const, href: '/zakat', image: '/icons/profile-2user.png' },
    { nameKey: 'takaful' as const, href: '/takaful', image: '/icons/purse(1).png' },
    { nameKey: 'investment' as const, href: '/investir', image: '/icons/status-up.png' },
  ];

  const profileDropdownItems = [
    { nameKey: 'personalInfo' as const, href: '/profil', image: '/icons/profile.png' },
    { nameKey: 'sadaqahScores' as const, href: '/profil/scores', image: '/icons/medal-star-g.png' },
    { nameKey: 'settings' as const, href: '/profil/parametres', image: '/icons/setting-2.png' },
    { nameKey: 'aboutAmane' as const, href: '/profil/a-propos', image: '/icons/information.png' },
    { nameKey: 'helpSupport' as const, href: '/profil/aide-support', image: '/icons/message-question.png' },
    { nameKey: 'termsConditions' as const, href: '/profil/termes', image: '/icons/security-safe.png' },
    { nameKey: 'logout' as const, href: '/', icon: LogOut, isLogout: true },
  ];

  const languageOptions: { id: Locale; labelKey: 'french' | 'english'; flag: string }[] = [
    { id: 'fr', labelKey: 'french', flag: '🇫🇷' },
    { id: 'en', labelKey: 'english', flag: '🇬🇧' },
  ];

  const formatAmount = (amount: number) => {
    const localeCode = locale === 'en' ? 'en-GB' : 'fr-FR';
    return new Intl.NumberFormat(localeCode, {
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

  const getUserFirstName = () => {
    if (user?.name) return user.name.split(' ')[0] || user.name;
    return tCommon('user');
  };

  const getInitials = () => {
    const name = (user?.name || '').trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
                  src="/logo/AMANE%201.svg" 
                  alt="Amane Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              ) : (
                <div className="w-36 h-36 rounded-lg flex items-center justify-center">
                  <Image 
                    src="/logo/AMANE%201.svg" 
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
                    {t('home')}
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
                      isActive('/transactions') ? 'brightness-0 saturate-100' : 'opacity-60'
                    }`}
                    style={isActive('/transactions') 
                      ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                      : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                    }
                  />
                  <Link
                    href="/transactions"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/transactions')
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    {t('transactions')}
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
                    style={isActive('/communaute') 
                      ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                      : { filter: 'brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                    }
                  />
                  <Link
                    href="/communaute"
                    className={`font-medium transition-colors duration-200 ${
                      isActive('/communaute')
                        ? 'text-white border-b-2 border-[#5CD07D] pb-1' 
                        : 'text-[#A8A9AB] hover:text-white'
                    }`}
                  >
                    {t('community')}
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
                    {t('services')}
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
                    {t('home')}
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
                    <span>{t('ourServices')}</span>
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
                    {t('whyAmane')}
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
                    {t('contactUs')}
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
                  onClick={() => {
                    setShowNotificationPopup(!showNotificationPopup);
                  }}
                >
                  <img 
                    src="/icons/notification-bing.png" 
                    alt="Notifications"
                    className="w-5 h-5 object-contain"
                  />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF3B30] rounded-full border-2 border-[#080909] text-[10px] font-bold text-white">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </motion.div>

                {/* User Profile */}
                <div className="relative" ref={profileDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 transition-colors duration-200"
                  >
                    <div className="relative">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.name || 'Profil'}
                          className="w-10 h-10 rounded-full border-2 border-[#5CD07D] object-cover"
                        />
                      ) : (
                        <span
                          className="w-10 h-10 rounded-full border-2 border-[#5CD07D] bg-[#5AB678] flex items-center justify-center text-white font-semibold text-sm"
                          aria-label={user?.name || 'Profil'}
                        >
                          {getInitials()}
                        </span>
                      )}
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
                        className="absolute right-0 mt-3 w-64 bg-[#1A1F1F] rounded-2xl shadow-2xl border border-[#00644D]/30 overflow-hidden z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Menu Items */}
                        <div className="py-2 pt-3">
                          {profileDropdownItems.filter(item => !item.isLogout).map((item, index) => {
                            const active = isActive(item.href);
                            return (
                              <motion.div
                                key={item.nameKey}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                  }}
                                  className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                                    active
                                      ? 'bg-[#00644D]/30 text-[#5CD07D] border-l-2 border-[#5CD07D]'
                                      : 'text-white hover:text-white hover:bg-[#00644D]/20'
                                  }`}
                                >
                                  {item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={t(item.nameKey)}
                                      className={`w-[18px] h-[18px] object-contain ${
                                        active ? 'opacity-100' : 'opacity-70'
                                      }`}
                                    />
                                  ) : (
                                    item.icon && (
                                      <item.icon 
                                        size={18} 
                                        className={active ? 'text-[#5CD07D]' : 'text-[#A8A9AB]'} 
                                      />
                                    )
                                  )}
                                  <span className="text-sm font-medium">{t(item.nameKey)}</span>
                                  {active && (
                                    <ChevronRight size={16} className="ml-auto text-[#5CD07D]" />
                                  )}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Séparateur */}
                        <div className="border-t border-[#00644D]/20 my-1"></div>

                        {/* Déconnexion */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: profileDropdownItems.filter(item => !item.isLogout).length * 0.05 }}
                        >
                          <Link
                            href="/"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsProfileDropdownOpen(false);
                              logout();
                              window.location.href = '/';
                            }}
                            className="flex items-center space-x-3 px-4 py-3 text-[#FF6B6B] hover:text-[#FF5252] hover:bg-red-500/10 transition-all duration-200"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">{t('logout')}</span>
                          </Link>
                        </motion.div>
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
                    <span className="font-medium">{t('signIn')}</span>
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
                    {t('signUp')}
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Sélecteur de langue (drapeau) */}
            <div className="relative hidden md:block" ref={languageDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/20"
                aria-label={tParametres('appLanguage')}
                title={tParametres('appLanguage')}
              >
                <span className="text-xl" aria-hidden>
                  {languageOptions.find((o) => o.id === locale)?.flag ?? '🌐'}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-white/80 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>
              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-44 bg-[#1A1F1F] rounded-xl shadow-2xl border border-[#00644D]/30 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {languageOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setLocale(option.id);
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2 px-4 py-2.5 text-left transition-colors ${
                            locale === option.id
                              ? 'bg-[#00644D]/30 text-[#00D9A5]'
                              : 'text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">{option.flag}</span>
                          <span className="text-sm font-medium">{tParametres(option.labelKey)}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sélecteur de langue mobile (drapeaux) */}
          <div className="relative md:hidden flex items-center" ref={languageDropdownRefMobile}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center space-x-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/20"
              aria-label={tParametres('appLanguage')}
              title={tParametres('appLanguage')}
            >
              <span className="text-xl" aria-hidden>
                {languageOptions.find((o) => o.id === locale)?.flag ?? '🌐'}
              </span>
              <ChevronDown
                size={14}
                className={`text-white/80 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
            <AnimatePresence>
              {isLanguageDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-[#1A1F1F] rounded-xl shadow-2xl border border-[#00644D]/30 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    {languageOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setLocale(option.id);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-4 py-2.5 text-left transition-colors ${
                          locale === option.id
                            ? 'bg-[#00644D]/30 text-[#00D9A5]'
                            : 'text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-lg">{option.flag}</span>
                        <span className="text-sm font-medium">{tParametres(option.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            className="md:hidden border-t bg-[#00644D] border-white/20"
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
                      className={isActive('/') ? 'text-[#5CD07D]' : 'text-white/90'} 
                    />
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{t('home')}</span>
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
                      style={isActive('/transactions') 
                        ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                        : { filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                      }
                    />
                    <Link
                      href="/transactions"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/transactions')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/90 hover:bg-white/10'
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
                      style={isActive('/communaute') 
                        ? { filter: 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(1234%) hue-rotate(89deg) brightness(102%) contrast(101%)' } 
                        : { filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }
                      }
                    />
                    <Link
                      href="/communaute"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/communaute')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">Communauté</span>
                    </Link>
                  </motion.div>

                  {/* Nos services - sous-éléments bien disposés */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="rounded-xl bg-white/10 overflow-hidden"
                  >
                    <div className="flex items-center space-x-2 px-4 py-3 border-b border-white/10">
                      <img 
                        src="/icons/category-2.png" 
                        alt="Services"
                        className="w-[18px] h-[18px] object-contain"
                        style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
                      />
                      <h3 className="text-sm font-semibold text-white">{t('ourServices')}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {servicesItems.map((item, index) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.nameKey}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 p-3 rounded-lg transition-colors duration-200 ${
                              active 
                                ? 'bg-white/25 text-white' 
                                : 'text-white/90 hover:bg-white/15'
                            }`}
                          >
                            <img 
                              src={item.image} 
                              alt={t(item.nameKey)}
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                            <span className="text-sm font-medium">{t(item.nameKey)}</span>
                          </Link>
                        );
                      })}
                    </div>
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
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{t('home')}</span>
                    </Link>
                  </motion.div>

                  {/* Nos services - sous-éléments bien disposés */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-xl bg-white/10 overflow-hidden"
                  >
                    <div className="flex items-center space-x-2 px-4 py-3 border-b border-white/10">
                      <img 
                        src="/icons/category-2.png" 
                        alt="Services"
                        className="w-[18px] h-[18px] object-contain"
                        style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
                      />
                      <h3 className="text-sm font-semibold text-white">{t('ourServices')}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {servicesItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.nameKey}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 p-3 rounded-lg transition-colors duration-200 ${
                              active 
                                ? 'bg-white/25 text-white' 
                                : 'text-white/90 hover:bg-white/15'
                            }`}
                          >
                            <img 
                              src={item.image} 
                              alt={t(item.nameKey)}
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                            <span className="text-sm font-medium">{t(item.nameKey)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Pourquoi Amane+? */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
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
                      className="p-3 rounded-lg transition-colors duration-200 text-white/90 hover:bg-white/10"
                    >
                      <span className="font-medium">{t('whyAmane')}</span>
                    </Link>
                  </motion.div>

                  {/* Contactez-nous */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className={`p-3 rounded-lg transition-colors duration-200 ${
                        isActive('/contact')
                          ? 'bg-white/20 text-white' 
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{t('contactUs')}</span>
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
                  className="pt-4 border-t border-white/20"
                >
                  {/* Notification Icon for Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="flex items-center justify-between p-3 mb-4"
                  >
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => {
                        setShowNotificationPopup(!showNotificationPopup);
                      }}
                    >
                      <img 
                        src="/icons/notification-bing.png" 
                        alt="Notifications"
                        className="w-5 h-5 object-contain"
                      />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF3B30] rounded-full border-2 border-[#3E4042] text-[10px] font-bold text-white">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  <div className="flex items-center space-x-2 p-3 mb-4">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.name || 'Profil'}
                        className="w-10 h-10 rounded-full border-2 border-[#5CD07D] object-cover"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full border-2 border-[#5CD07D] bg-[#5AB678] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getInitials()}
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Salam, {getUserFirstName()}
                      </p>
                      <p className="text-xs text-white/70">
                        La patience est lumière ✨
                      </p>
                    </div>
                  </div>
                  
                  {profileDropdownItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <motion.div
                        key={item.nameKey}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            if (item.isLogout) e.preventDefault();
                            setIsOpen(false);
                            if (item.isLogout) {
                              logout();
                              window.location.href = '/';
                            }
                          }}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                            item.isLogout 
                              ? 'text-red-300 hover:text-red-200 hover:bg-red-500/20' 
                              : active
                                ? 'bg-white/20 text-white'
                                : 'text-white/90 hover:bg-white/10'
                          }`}
                        >
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={t(item.nameKey)}
                              className="w-5 h-5 object-contain opacity-80"
                            />
                          ) : (
                            item.icon && (
                              <item.icon size={20} className={item.isLogout ? 'text-red-400' : 'text-white'} />
                            )
                          )}
                          <span className="font-medium">{t(item.nameKey)}</span>
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
                    <span className="font-medium">{t('signIn')}</span>
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-lg text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(to right, #8ECAAB, #38B7B1)' }}
                  >
                    <span className="font-medium">{t('signUp')}</span>
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
                    key={service.nameKey}
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
                        alt={t(service.nameKey)}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-sm font-medium">{t(service.nameKey)}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Notification Popup */}
    <NotificationPopup
      isOpen={showNotificationPopup}
      onClose={() => setShowNotificationPopup(false)}
    />
    </>
  );
} 