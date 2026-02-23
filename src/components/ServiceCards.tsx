'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import AskForHelpModal from './AskForHelpModal';

interface ServiceCard {
  href: string;
  image: string;
  altKey: 'donations' | 'takaful' | 'investment' | 'zakat';
  height: string;
  delay: number;
  paddingClass?: string;
  textPaddingClass?: string;
}

interface ServiceCardsProps {
  showHelpButton?: boolean;
}

export default function ServiceCards({ showHelpButton = true }: ServiceCardsProps) {
  const t = useTranslations('home.serviceCards');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const services: ServiceCard[] = [
    { href: '/campagnes', image: '/images/Image(5).png', altKey: 'donations', height: '217px', delay: 0.1, paddingClass: 'p-4 pt-0 pl-0', textPaddingClass: 'pl-4 pb-4' },
    { href: '/takaful', image: '/images/Image(4).png', altKey: 'takaful', height: '217px', delay: 0.2, paddingClass: 'p-0', textPaddingClass: 'pl-4 pb-4' },
    { href: '/investir', image: '/images/Image(6).png', altKey: 'investment', height: '217px', delay: 0.3, paddingClass: 'p-4 pt-0 pl-0', textPaddingClass: 'pl-4' },
    { href: '/zakat', image: '/images/Image(7).png', altKey: 'zakat', height: '217px', delay: 0.4, paddingClass: 'p-4 pt-0 pl-0', textPaddingClass: 'pl-4' }
  ];

  return (
    <div className="lg:col-span-1">
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <Link key={service.href} href={service.href} className="w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: service.delay }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-[#83CBB4] rounded-4xl ${service.paddingClass} flex flex-col justify-between cursor-pointer hover:bg-[#7FB88E] transition-colors w-full`}
              style={{ height: service.height }}
            >
              <img src={service.image} alt={t(service.altKey)} className="object-contain self-start" />
              <span className={`text-white font-semibold ${service.textPaddingClass || ''}`}>{t(service.altKey)}</span>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Bouton Demande d'aide */}
      {showHelpButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsHelpModalOpen(true)}
          className="mt-4 w-full bg-[#83CBB4] hover:bg-[#7FB88E] text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-3"
        >
          <img src="/icons/volume-high.png" alt="" className="w-5 h-5 object-contain" />
          {t('helpRequest')}
        </motion.button>
      )}

      {/* Modal de demande d'aide */}
      <AskForHelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </div>
  );
}
