'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const footerLinks = {
    services: [
      { nameKey: 'zakat' as const, href: '/zakat' },
      { nameKey: 'donations' as const, href: '/campagnes' },
      { nameKey: 'takaful' as const, href: '/takaful' },
      { nameKey: 'investment' as const, href: '/investir' },
    ],
    produits: [
      { nameKey: 'takaful' as const, href: '/takaful' },
      { nameKey: 'investments' as const, href: '/investir' },
    ],
    aides: [
      { nameKey: 'helpCenter' as const, href: '/aide' },
      { nameKey: 'faq' as const, href: '/faq' },
      { nameKey: 'support' as const, href: '/contact' },
      { nameKey: 'privacy' as const, href: '/confidentialite' },
      { nameKey: 'termsAndConditions' as const, href: '/termes-conditions' },
      { nameKey: 'childProtection' as const, href: '/protection-enfants' },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center mb-4">
                <img 
                  src="/amane-logo.png" 
                  alt="Amane+" 
                  className="h-12 w-auto object-contain"
                />
              <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                  <img 
                    src="/logo/AMANE%201.svg" 
                    alt="Amane+ Logo" 
                    className="w-full h-full object-contain"
                  />
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('tagline')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail size={16} />
                <span>contact@amane.ci</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail size={16} />
                <span>infos@amane.ci</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone size={16} />
                <span>+225 07 20 00 00 06</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone size={16} />
                <span>+225 27 22 22 34 64</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin size={16} />
                <span>Siège social : Abidjan-Cocody, La Villa Nova Rue B5, Corniche</span>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.nameKey}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Produits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('products')}</h3>
            <ul className="space-y-2">
              {footerLinks.produits.map((link) => (
                <li key={link.nameKey}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Entreprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('help')}</h3>
            <ul className="space-y-2">
              {footerLinks.aides.map((link) => (
                <li key={link.nameKey}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <Heart size={16} className="text-red-500" />
              <span>{t('madeWithLove')}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Amane+. {t('allRightsReserved')}</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 