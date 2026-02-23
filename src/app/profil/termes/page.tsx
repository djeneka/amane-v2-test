'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function TermesPage() {
  const t = useTranslations('profil');
  const sections = [
    {
      icon: '/icons/security-safe.png',
      title: t('termesTitle'),
      content: t('termesContent'),
    },
  ];

  return (
    <div className="space-y-8">

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#101919] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Image src={section.icon as string} alt={section.title} width={24} height={24} className="w-12 h-12 object-contain rounded-3xl p-2 bg-[#00644D]/30" />
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>
            <div className="text-white/80 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
