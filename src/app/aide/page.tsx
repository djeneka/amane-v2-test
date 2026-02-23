'use client';

import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, MessageCircle, FileText, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AidePage() {
  const t = useTranslations('home.aide');

  const ressources = [
    { titleKey: 'faqTitle' as const, descKey: 'faqDesc' as const, href: '/faq', icon: HelpCircle },
    { titleKey: 'supportTitle' as const, descKey: 'supportDesc' as const, href: '/contact', icon: MessageCircle },
    { titleKey: 'privacyTitle' as const, descKey: 'privacyDesc' as const, href: '/confidentialite', icon: FileText },
    { titleKey: 'termsTitle' as const, descKey: 'termsDesc' as const, href: '/termes-conditions', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-[#0B302F]">
      <section
        className="relative text-white overflow-hidden py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/contact/centre-aide.png)' }}
      >
        <div className="absolute inset-0 bg-[#0B302F]/80" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              {t('backHome')}
            </Link>
            <div className="flex justify-center mb-4">
              <BookOpen size={48} className="text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {ressources.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="block h-full p-8 bg-[#101919] rounded-2xl border border-white/10 hover:border-[#5AB678]/50 hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="w-14 h-14 bg-[#5AB678]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5AB678]/30 transition-colors">
                    <item.icon size={28} className="text-[#5AB678]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#5AB678] transition-colors">
                    {t(item.titleKey)}
                  </h2>
                  <p className="text-white/70 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-white/70 mb-4">{t('notFound')}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#5AB678] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#4a9565] transition-colors"
            >
              <MessageCircle size={20} />
              {t('contactSupport')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
