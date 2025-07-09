'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Heart, Calculator, Shield, TrendingUp, Home, Users, Gift, Wallet, Settings, ChevronDown, LogOut, PiggyBank, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser } from '@/data/mockData';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Zakat', href: '/zakat', icon: Calculator },
    { name: 'Campagnes', href: '/campagnes', icon: Heart },
    { name: 'Faire un Don', href: '/don', icon: Gift },
    { name: 'Takaful', href: '/takaful', icon: Shield },
    { name: 'Investir', href: '/investir', icon: TrendingUp },
    { name: 'Épargne', href: '/epargne', icon: Wallet },
  ];

  const profileDropdownItems = [
    { name: 'Profil', href: '/profil', icon: User },
    { name: 'Points', href: '/points', icon: Users },
    { name: 'Portefeuille', href: '/portefeuille', icon: Wallet },
    { name: 'Mes Épargnes', href: '/mes-epargnes', icon: Wallet },
    { name: 'Mes Takafuls', href: '/mes-takafuls', icon: Shield },
    { name: 'Déconnexion', href: '/logout', icon: LogOut, isLogout: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
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
              <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Amane+</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
              
              {/* Profile dropdown items in mobile */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navigationItems.length * 0.05 }}
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
                        transition={{ duration: 0.3, delay: (navigationItems.length + index + 1) * 0.05 }}
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
                  transition={{ duration: 0.3, delay: navigationItems.length * 0.05 }}
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