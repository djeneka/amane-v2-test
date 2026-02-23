'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ProtectionEnfantsPage() {
  const t = useTranslations('home.protectionEnfants');

  return (
    <div className="min-h-screen bg-[#0B302F]">
      <section
        className="relative text-white overflow-hidden py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/contact/terme.png)' }}
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
              <ShieldCheck size={48} className="text-white/90" />
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#101919] rounded-2xl border border-white/10 p-8 space-y-8 text-white/80 leading-relaxed"
          >

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section1Title')}</h2>
              <p className="mb-4">{t('section1Intro')}</p>
              <p className="mb-2">{t('section1ListLabel')}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('section1Item1')}</li>
                <li>{t('section1Item2')}</li>
                <li>{t('section1Item3')}</li>
                <li>{t('section1Item4')}</li>
                <li>{t('section1Item5')}</li>
              </ul>
              <p className="mt-4">{t('section1Outro')}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section2Title')}</h2>
              <p className="mb-2">{t('section2Intro')}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('section2Item1')}</li>
                <li>{t('section2Item2')}</li>
                <li>{t('section2Item3')}</li>
                <li>{t('section2Item4')}</li>
              </ul>
              <p className="mt-4">{t('section2Outro')}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section3Title')}</h2>
              <p className="mb-4">{t('section3Intro')}</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>{t('section3Item1')}</li>
                <li>{t('section3Item2')}</li>
                <li>{t('section3Item3')}</li>
              </ul>
              <p className="mb-4">{t('section3Paragraph1')}</p>
              <p className="mb-2">{t('section3Paragraph2')}</p>
              <p>
                <a href="mailto:infos@amane.ci" className="text-[#5AB678] hover:underline font-medium">infos@amane.ci</a>
              </p>
              <p className="mt-4">{t('section3Paragraph3')}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section4Title')}</h2>
              <p className="mb-2">{t('section4Intro')}</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>{t('section4Item1')}</li>
                <li>{t('section4Item2')}</li>
                <li>{t('section4Item3')}</li>
                <li>{t('section4Item4')}</li>
              </ul>
              <p className="mb-2">{t('section4Intro2')}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('section4Item2_1')}</li>
                <li>{t('section4Item2_2')}</li>
                <li>{t('section4Item2_3')}</li>
                <li>{t('section4Item2_4')}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section5Title')}</h2>
              <p>{t('section5Content1')}</p>
              <p className="mt-4">{t('section5Content2')}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section6Title')}</h2>
              <p>{t('section6Content1')}</p>
              <p className="mt-4">{t('section6Content2')}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">{t('section7Title')}</h2>
              <p>{t('section7Content')}</p>
            </div>

            <p className="text-sm text-white/60 pt-4">
              {t('lastUpdate')}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
