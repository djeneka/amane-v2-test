'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AProposPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Qu\'est-ce qu\'Amane+ ?',
      answer: 'Amane+ est une plateforme innovante qui facilite les actes de bienfaisance et renforce les liens communautaires à travers la technologie moderne, tout en respectant les valeurs islamiques. Nous offrons une solution complète pour les dons, la Zakat, le Takaful et d\'autres formes de bienfaisance, rendant la générosité accessible, transparente et impactante pour tous.',
    },
    {
      question: 'Quelle est notre mission ?',
      answer: 'Notre mission est de rendre la générosité accessible, transparente et impactante pour tous. Nous facilitons les dons, la Zakat, le Takaful et d\'autres formes de bienfaisance en utilisant la technologie pour créer un pont entre les donateurs et ceux qui en ont besoin. Nous croyons que chaque acte de générosité, aussi petit soit-il, peut créer un impact positif significatif dans la communauté.',
    },
    {
      question: 'Quels services proposons-nous ?',
      answer: 'Amane+ propose une gamme complète de services de bienfaisance :\n\n• Dons : Contribuez à des projets et causes qui vous tiennent à cœur\n• Zakat : Calculez et payez votre Zakat facilement grâce à notre calculateur\n• Takaful : Souscrivez à une assurance mutuelle conforme à la Charia\n• Investissements : Investissez dans des projets éthiques et durables\n• Épargne : Épargnez tout en contribuant à des causes caritatives\n\nTous nos services sont conçus pour être transparents, sécurisés et conformes aux principes islamiques.',
    },
    {
      question: 'Quel impact dans la communauté ?',
      answer: 'Depuis notre lancement, Amane+ a permis de :\n\n• Collecter plus de 2.5 millions XOF en dons\n• Financer plus de 150 projets communautaires\n• Rassembler une communauté de plus de 50 000 utilisateurs actifs\n• Desservir 15 pays à travers l\'Afrique de l\'Ouest\n\nChaque transaction sur notre plateforme contribue directement à améliorer la vie des personnes dans le besoin, tout en renforçant les liens communautaires et en promouvant les valeurs de solidarité et d\'entraide.',
    },
    {
      question: 'Qui sommes-nous ?',
      answer: 'Amane+ est une équipe passionnée de professionnels dédiés à la création d\'un impact positif dans la communauté. Nous combinons expertise technologique, connaissance des principes islamiques et engagement envers la transparence pour offrir une plateforme de confiance. Notre vision est de devenir la référence pour la bienfaisance numérique dans le monde musulman, en créant un écosystème où chaque acte de générosité contribue à construire un avenir meilleur pour tous.',
    },
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
