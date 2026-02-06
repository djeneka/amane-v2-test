'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function TermesPage() {
  const sections = [
    {
      icon: '/icons/security-safe.png',
      title: 'Conditions d\'utilisation',
      content: `En utilisant la plateforme Amane+, vous acceptez de respecter les conditions d'utilisation suivantes :

1. Utilisation de la plateforme
   - Vous devez être âgé d'au moins 18 ans pour utiliser nos services
   - Vous êtes responsable de maintenir la confidentialité de votre compte
   - Vous acceptez de fournir des informations exactes et à jour

2. Transactions
   - Toutes les transactions sont finales et non remboursables, sauf cas exceptionnels
   - Les frais de transaction peuvent s'appliquer selon le mode de paiement
   - Nous nous réservons le droit de refuser toute transaction suspecte

3. Comportement
   - Vous vous engagez à utiliser la plateforme de manière légale et éthique
   - Toute activité frauduleuse entraînera la suspension immédiate de votre compte
   - Le respect de la communauté est essentiel`,
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
