'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AProposPage() {
  const t = useTranslations('profil');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { question: t('aProposQ1'), answer: t('aProposA1') },
    { question: t('aProposQ2'), answer: t('aProposA2') },
    { question: t('aProposQ3'), answer: t('aProposA3') },
    { question: t('aProposQ4'), answer: t('aProposA4') },
    { question: t('aProposQ5'), answer: t('aProposA5') },
  ];

  return (
    <div className="space-y-4">
      {/* FAQ Items */}
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden"
        >
          <button
            onClick={() => setOpenFaq(openFaq === index ? null : index)}
            className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-white font-medium pr-4">{faq.question}</span>
            {openFaq === index ? (
              <ChevronUp size={20} className="text-[#00D9A5] flex-shrink-0" />
            ) : (
              <ChevronDown size={20} className="text-[#00D9A5] flex-shrink-0" />
            )}
          </button>
          <AnimatePresence>
            {openFaq === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-white/70 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
