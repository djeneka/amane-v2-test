'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AskForHelpModal from './AskForHelpModal';

interface ServiceCard {
  href: string;
  image: string;
  alt: string;
  label: string;
  height: string;
  delay: number;
  paddingClass?: string;
  textPaddingClass?: string;
}

const services: ServiceCard[] = [
  {
    href: '/campagnes',
    image: '/images/Image(5).png',
    alt: 'Dons',
    label: 'Dons',
    height: '217px',
    delay: 0.1,
    paddingClass: 'p-4 pt-0 pl-0',
    textPaddingClass: 'pl-4 pb-4'
  },
  {
    href: '/takaful',
    image: '/images/Image(4).png',
    alt: 'Takaful',
    label: 'Takaful',
    height: '217px',
    delay: 0.2,
    paddingClass: 'p-0',
    textPaddingClass: 'pl-4 pb-4'
  },
  {
    href: '/investir',
    image: '/images/Image(6).png',
    alt: 'Investissement',
    label: 'Investissement',
    height: '217px',
    delay: 0.3,
    paddingClass: 'p-4 pt-0 pl-0',
    textPaddingClass: 'pl-4'
  },
  {
    href: '/zakat',
    image: '/images/Image(7).png',
    alt: 'Zakat',
    label: 'Zakat',
    height: '217px',
    delay: 0.4,
    paddingClass: 'p-4 pt-0 pl-0',
    textPaddingClass: 'pl-4'
  }
];

interface ServiceCardsProps {
  showHelpButton?: boolean;
}

export default function ServiceCards({ showHelpButton = true }: ServiceCardsProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="lg:col-span-1">
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <Link key={service.href} href={service.href} className="w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: service.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-[#83CBB4] rounded-4xl ${service.paddingClass} flex flex-col justify-between cursor-pointer hover:bg-[#7FB88E] transition-colors w-full`}
              style={{ height: service.height }}
            >
              <img src={service.image} alt={service.alt} className="object-contain self-start" />
              <span className={`text-white font-semibold ${service.textPaddingClass || ''}`}>{service.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Bouton Demande d'aide */}
      {showHelpButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsHelpModalOpen(true)}
          className="mt-4 w-full bg-[#83CBB4] hover:bg-[#7FB88E] text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-3"
        >
          <img src="/icons/volume-high.png" alt="" className="w-5 h-5 object-contain" />
          Demande de l'aide
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
