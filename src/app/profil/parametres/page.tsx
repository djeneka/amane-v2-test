'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Languages, ChevronRight, Palette, Sun, Moon, Settings, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';

export default function ParametresPage() {
  const [notifications, setNotifications] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en'>('fr');
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown du thème si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isThemeDropdownOpen || isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeDropdownOpen, isLanguageDropdownOpen]);

  const themeOptions = [
    {
      id: 'light' as const,
      label: 'Mode Clair',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      label: 'Mode Sombre',
      icon: Moon,
    },
    {
      id: 'system' as const,
      label: 'Suivre le système',
      icon: Settings,
    },
  ];

  const languageOptions = [
    {
      id: 'fr' as const,
      label: 'Français',
      flag: '🇫🇷',
    },
    {
      id: 'en' as const,
      label: 'Anglais',
      flag: '🇬🇧',
    },
  ];

  const settings = [
    {
      id: 'theme',
      label: 'Thème',
      icon: Palette,
      type: 'dropdown' as const,
      onClick: () => setIsThemeDropdownOpen(!isThemeDropdownOpen),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      type: 'toggle' as const,
      value: notifications,
      onChange: () => setNotifications(!notifications),
    },
    {
      id: 'language',
      label: 'Langue de l\'application',
      icon: Languages,
      type: 'dropdown' as const,
      onClick: () => setIsLanguageDropdownOpen(!isLanguageDropdownOpen),
    },
  ];

  return (
    <div>
      {/* Settings Container */}
      <div className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden">
        {settings.map((setting, index) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {index > 0 && <div className="h-px bg-white/10" />}
            {setting.type === 'dropdown' ? (
              <button
                onClick={setting.onClick}
                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors text-left"
                aria-label={`Ouvrir ${setting.label}`}
                title={`Ouvrir ${setting.label}`}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <setting.icon size={24} className="text-[#00D9A5] flex-shrink-0" />
                  <span className="text-white font-medium">{setting.label}</span>
                </div>
                <motion.div
                  animate={{ 
                    rotate: (setting.id === 'theme' && isThemeDropdownOpen) || 
                            (setting.id === 'language' && isLanguageDropdownOpen) ? 180 : 0 
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-white/50 flex-shrink-0"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
            ) : (
              <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-2 flex-1">
                  <setting.icon size={24} className="text-[#00D9A5] flex-shrink-0" />
                  <span className="text-white font-medium">{setting.label}</span>
                </div>
                
                {setting.type === 'toggle' && (
                  <button
                    onClick={setting.onChange}
                    aria-label={`${setting.value ? 'Désactiver' : 'Activer'} ${setting.label}`}
                    title={`${setting.value ? 'Désactiver' : 'Activer'} ${setting.label}`}
                    className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-[#00D9A5]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        setting.value ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isThemeDropdownOpen && (
          <motion.div
            ref={themeDropdownRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-[#101919] rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start space-x-3">
                <div className="p-3">
                  <Image src="/icons/Title(1).png" alt="Theme" width={36} height={36} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Définissez votre thème
                  </h3>
                  <p className="text-white/70 text-sm">
                    Adaptez l'apparence de l'application selon vos préférences.
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Options */}
            <div className="p-4 space-y-2">
              {themeOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedTheme(option.id);
                    setIsThemeDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  {/* Radio Button */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTheme === option.id
                          ? 'border-[#00D9A5]'
                          : 'border-white/30'
                      }`}
                    >
                      {selectedTheme === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-[#00D9A5]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Label and Icon */}
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-white font-medium">{option.label}</span>
                    <option.icon
                      size={20}
                      className={`flex-shrink-0 ${
                        option.id === 'system'
                          ? 'text-white/50'
                          : option.id === 'light'
                          ? 'text-yellow-400'
                          : 'text-white'
                      }`}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isLanguageDropdownOpen && (
          <motion.div
            ref={languageDropdownRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-[#101919] rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start space-x-3">
                <div className="bg-[#00644D]/20 p-3 rounded-lg">
                  <Languages size={24} className="text-[#00D9A5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Langue
                  </h3>
                  <p className="text-white/70 text-sm">
                    Veuillez définir la langue que vous préférez
                  </p>
                </div>
              </div>
            </div>

            {/* Language Options */}
            <div className="p-4 space-y-2">
              {languageOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedLanguage(option.id);
                    setIsLanguageDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  {/* Checkmark */}
                  {selectedLanguage === option.id && (
                    <Check size={20} className="text-[#00D9A5] flex-shrink-0" />
                  )}
                  {selectedLanguage !== option.id && (
                    <div className="w-5 flex-shrink-0" />
                  )}

                  {/* Flag and Label */}
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-2xl">{option.flag}</span>
                    <span className="text-white font-medium">{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
