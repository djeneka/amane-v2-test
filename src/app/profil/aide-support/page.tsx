'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Phone, MapPin, Map } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AideSupportPage() {
  const t = useTranslations('profil');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { question: t('aideSupportQ1'), answer: t('aideSupportA1') },
    { question: t('aideSupportQ2'), answer: t('aideSupportA2') },
    { question: t('aideSupportQ3'), answer: t('aideSupportA3') },
    { question: t('aideSupportQ4'), answer: t('aideSupportA4') },
  ];

  return (
    <div className="space-y-8">
      {/* FAQ Section */}
      <div>
        {/* FAQ Title */}
        <div className="rounded-t-2xl p-6">
          <h2 className="text-xl font-bold text-white">
            {t('aideSupportFaqTitle')}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="bg-[#101919] rounded-2xl p-6 space-y-3">
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
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
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
                    <div className="px-4 pb-4 text-white/70 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div>
        {/* Contact Title */}
        <div className=" rounded-t-2xl p-6">
          <h2 className="text-xl font-bold text-white">
            {t('aideSupportContactTitle')}
          </h2>
        </div>

        {/* Contact Content */}
        <div className="bg-[#101919] rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Contact Methods */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                {t('aideSupportHowToContact')}
              </h3>
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D9A5] flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{t('aideSupportEmail')}</p>
                    <a
                      href="mailto:contact@amane.ci"
                      className="text-[#00D9A5] underline hover:text-[#00D9A5]/80 transition-colors"
                    >
                      contact@amane.ci
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D9A5] flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{t('aideSupportWhatsapp')}</p>
                    <a
                      href="https://wa.me/2250720000006"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00D9A5] underline hover:text-[#00D9A5]/80 transition-colors"
                    >
                      +225 07 20 00 00 06
                    </a>
                  </div>
                </div>

                {/* Fixe */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D9A5] flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{t('aideSupportPhone')}</p>
                    <a
                      href="tel:+2252722223464"
                      className="text-[#00D9A5] underline hover:text-[#00D9A5]/80 transition-colors"
                    >
                      +225 27 22 22 34 64
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Location */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <MapPin size={20} className="text-[#00D9A5]" />
                <h3 className="text-lg font-semibold text-white">{t('aideSupportLocation')}</h3>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-white font-bold uppercase text-sm">{t('aideSupportOffices')}</p>
                <p className="text-white whitespace-pre-line">{t('aideSupportAddress')}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-6 py-3 bg-[#00D9A5] text-white rounded-2xl hover:bg-[#00D9A5]/80 transition-colors"
                onClick={() => {
                  window.open('https://www.google.com/maps/search/?api=1&query=Cocody+Corniche+Rue+B5+La+Villa+Nova+Abidjan', '_blank');
                }}
              >
                <Map size={18} className="text-white" />
                <span>{t('aideSupportViewOnMap')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
