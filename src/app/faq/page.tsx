'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment effectuer un don ?',
      answer: 'Pour faire un don, accédez à la section "Dons" ou "Campagnes" dans le menu principal, choisissez votre projet ou cause, puis suivez les instructions pour compléter votre don. Vous pouvez payer par carte bancaire, mobile money ou portefeuille Amane+.',
    },
    {
      question: 'Comment calculer ma Zakat ?',
      answer: 'Notre calculateur de Zakat vous guide étape par étape. Accédez à la section "Zakat", entrez vos informations financières (épargnes, or, argent, etc.), et notre système calculera automatiquement le montant de votre Zakat (généralement 2,5 % de vos avoirs éligibles).',
    },
    {
      question: 'Qu\'est-ce que le Takaful ?',
      answer: 'Le Takaful est une assurance solidaire conforme aux principes de la finance islamique. Les participants mutualisent leurs contributions pour se protéger mutuellement, sans intérêt (riba) et avec une gestion transparente des fonds.',
    },
    {
      question: 'Comment investir avec Amane+ ?',
      answer: 'Rendez-vous dans la section "Investir" pour découvrir les projets d\'investissement halal disponibles. Après création de votre compte et vérification, vous pouvez choisir un projet et participer selon les modalités indiquées.',
    },
    {
      question: 'Comment contacter le service client ?',
      answer: 'Vous pouvez nous contacter par email à contact@amane-plus.com, par téléphone au +225 27 22 49 89 00, ou via le formulaire sur notre page Contact. Notre équipe est disponible pour vous aider.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B302F]">
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Retour à l&apos;accueil
            </Link>
            <div className="flex justify-center mb-4">
              <HelpCircle size={48} className="text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Des réponses simples aux questions les plus courantes sur Amane+
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#101919] rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-[#5AB678] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-[#5AB678] flex-shrink-0" />
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
                      <div className="px-5 pb-5 text-white/70 leading-relaxed border-t border-white/10 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-white/70 mb-4">Vous n&apos;avez pas trouvé votre réponse ?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#5AB678] hover:underline font-medium"
            >
              Contactez notre support
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
