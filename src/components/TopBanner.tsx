'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TopBannerProps {
  text?: string;
  buttonText?: string;
  buttonHref?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function TopBanner({
  text,
  buttonText,
  buttonHref = '/campagnes',
  dismissible = true,
  onDismiss
}: TopBannerProps) {
  const t = useTranslations('topBanner');
  const [isVisible, setIsVisible] = useState(true);
  const displayText = text ?? t('text');
  const displayButtonText = buttonText ?? t('button');

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
      style={{
        background: 'linear-gradient(to right, #8FC99E, #20B6B3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-4 relative">
          <p className="text-sm md:text-base font-medium text-white text-center">
            {displayText}
          </p>
          <Link href={buttonHref}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white px-6 py-2 rounded-full font-semibold text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
              style={{
                color: '#20B6B3'
              }}
            >
              {displayButtonText}
            </motion.button>
          </Link>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1"
              aria-label={t('closeAria')}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
